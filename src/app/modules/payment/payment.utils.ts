import PDFDocument from 'pdfkit';

interface InvoiceData {
    invoiceId: string;
    customerName: string;
    customerEmail: string;
    orderItems: { name: string; quantity: number; price: number }[];
    orderDate: string;
    amount: number;
    transactionId: string;
    paymentDate: string;
}

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => {
                chunks.push(chunk);
            });

            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            doc.on('error', (error) => {
                reject(error);
            });

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text('E-Commerce Store', { align: 'center' });
            doc.moveDown(1);

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // Invoice Details
            doc.fontSize(11).font('Helvetica-Bold').text('Invoice Information');
            doc.fontSize(10).font('Helvetica')
                .text(`Invoice ID: ${data.invoiceId}`)
                .text(`Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`)
                .text(`Transaction ID: ${data.transactionId}`);

            doc.moveDown(0.8);

            // Customer Information
            doc.fontSize(11).font('Helvetica-Bold').text('Customer Information');
            doc.fontSize(10).font('Helvetica')
                .text(`Name: ${data.customerName}`)
                .text(`Email: ${data.customerEmail}`);

            doc.moveDown(0.8);

            // Order Details
            doc.fontSize(11).font('Helvetica-Bold').text('Order Details');
            doc.fontSize(10).font('Helvetica')
                .text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`);

            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // Items Table
            const col1X = 50;
            const col2X = 300;
            const col3X = 400;
            const col4X = 480;

            doc.fontSize(11).font('Helvetica-Bold').text('Order Items');
            doc.moveDown(0.5);

            const headerY = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Product', col1X, headerY);
            doc.text('Qty', col2X, headerY);
            doc.text('Unit Price', col3X, headerY);
            doc.text('Subtotal', col4X, headerY);

            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            for (const item of data.orderItems) {
                const rowY = doc.y;
                doc.fontSize(10).font('Helvetica');
                doc.text(item.name, col1X, rowY, { width: 230 });
                doc.text(String(item.quantity), col2X, rowY);
                doc.text(`${item.price.toFixed(2)}`, col3X, rowY);
                doc.text(`${(item.price * item.quantity).toFixed(2)}`, col4X, rowY);
                doc.moveDown(0.5);
            }

            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            // Total
            const totalY = doc.y;
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Total Amount', col1X, totalY);
            doc.text(`${data.amount.toFixed(2)} BDT`, col4X, totalY);

            doc.moveTo(col1X, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1.5);

            // Footer
            doc.fontSize(9).font('Helvetica')
                .text('Thank you for your purchase. This is an electronically generated invoice.', { align: 'center' })
                .text('For any questions, please contact support.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};