/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { stripe } from "../../config/stripe.config";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { generateInvoicePdf } from "./payment.utils";


const handlerStripeWebhookEvent = async (event : Stripe.Event) =>{

    const existingPayment = await prisma.payment.findFirst({
        where:{
            stripeEventId : event.id
        }
    })

    if(existingPayment){
        console.log(`Event ${event.id} already processed. Skipping`);
        return {message : `Event ${event.id} already processed. Skipping`}
    }

    switch(event.type){
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const orderId = session.metadata?.orderId;
            const paymentId = session.metadata?.paymentId;

            if (!orderId || !paymentId) {
                console.error("⚠️ Missing metadata in webhook event");
                return { message: "Missing metadata" };
            }

            // Verify order exists with related data
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    customer: true,
                    orderItems: { include: { product: true } },
                    payment: true
                }
            });

            if (!order) {
                console.error(`⚠️ order ${orderId} not found. Payment may be for expired order.`);
                return { message: "order not found" };
            }
            let pdfBuffer: Buffer | null = null;

            // Update both order and payment in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const updatedorder = await tx.order.update({
                    where: {
                        id: orderId
                    },
                    data: {
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                    }
                });

                let invoiceUrl = null;
                

                // If payment is successful, generate and upload invoice
                if (session.payment_status === "paid") {
                    try {
                        // Generate invoice PDF
                        pdfBuffer = await generateInvoicePdf({
                            invoiceId: order.payment?.id || paymentId,
                            customerName: order.customer.name,
                            customerEmail: order.customer.email,
                            orderItems: order.orderItems.map((i) => ({
                                name: i.product.name,
                                quantity: i.quantity,
                                price: i.product.price,
                            })),
                            orderDate: order.createdAt.toString(),
                            amount: order.payment?.amount || 0,
                            transactionId: order.payment?.transactionId || "",
                            paymentDate: new Date().toISOString()
                        });

                        // Upload PDF to Cloudinary
                        const cloudinaryResponse = await uploadFileToCloudinary(
                            pdfBuffer,
                            `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`
                        );

                        invoiceUrl = cloudinaryResponse?.secure_url;

                        console.log(`✅ Invoice PDF generated and uploaded for payment ${paymentId}`);
                    } catch (pdfError) {
                        console.error("❌ Error generating/uploading invoice PDF:", pdfError);
                        // Continue with payment update even if PDF generation fails
                    }
                }

                const updatedPayment = await tx.payment.update({
                    where: {
                        id: paymentId
                    },
                    data: {
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session,
                        invoiceUrl: invoiceUrl, // Store invoice URL
                        stripeEventId: event.id // Store event ID for idempotency
                    }
                });

                return { updatedorder, updatedPayment, invoiceUrl };
            });

            // Send invoice email to customer (outside transaction to avoid blocking payment update)
            if (session.payment_status === "paid" && result.invoiceUrl) {
                try {
                    await sendEmail({
                        to: order.customer.email,
                        subject: `Payment Confirmation & Invoice - Order #${orderId}`,
                        templateName: "invoice",
                        templateData: {
                            customerName: order.customer.name,
                            invoiceId: order.payment?.id || paymentId,
                            transactionId: order.payment?.transactionId || "",
                            paymentDate: new Date().toLocaleDateString(),
                            orderItems: order.orderItems.map((i) => ({
                                name: i.product.name,
                                quantity: i.quantity,
                                price: i.product.price,
                            })),
                            orderDate: new Date(order.createdAt).toLocaleDateString(),
                            amount: order.payment?.amount || 0,
                            invoiceUrl: result.invoiceUrl
                        },
                        attachments: [
                            {
                                filename: `Invoice-${paymentId}.pdf`,
                                content: pdfBuffer || Buffer.from(""), // Attach PDF if generated, else empty buffer
                                contentType: 'application/pdf'
                            }
                        ]
                    });

                    console.log(`✅ Invoice email sent to ${order.customer.email}`);
                } catch (emailError) {
                    console.error("❌ Error sending invoice email:", emailError);
                    // Log but don't fail the payment if email fails
                }
            }

            console.log(`✅ Payment ${session.payment_status} for order ${orderId}`);
            break;
        }

        case "checkout.session.expired" : {
                const session = event.data.object

                console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
                break;

        }
        case "payment_intent.payment_failed" : {
            const session = event.data.object

            console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
            break;
        }
        default :
            console.log(`Unhandled event type ${event.type}`);
    }

    return {message : `Webhook Event ${event.id} processed successfully`}
}

const createCheckoutSession = async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            customer: true,
            orderItems: { include: { product: true } },
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    if (order.customer.userId !== userId) {
        throw new Error("Forbidden: this order does not belong to you");
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
        throw new Error("Order is already paid");
    }

    const lineItems = order.orderItems.map((item) => ({
        price_data: {
            currency: "usd",
            product_data: { name: item.product.name },
            unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
    }));

    const amount = order.orderItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    // Upsert payment record first so we have the paymentId for metadata
    const payment = await prisma.payment.upsert({
        where: { orderId },
        update: { amount },
        create: {
            orderId,
            amount,
            transactionId: "pending",
        },
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: { orderId, paymentId: payment.id },
    });

    // Store the session ID as transactionId
    await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: session.id },
    });

    return { checkoutUrl: session.url };
};

export const PaymentService = {
    handlerStripeWebhookEvent,
    createCheckoutSession,
}