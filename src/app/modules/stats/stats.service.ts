import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user : IRequestUser) => {
    let statsData;

    switch(user.role){
        case Role.SUPER_ADMIN:
            statsData = getSuperAdminStatsData();
            break;
        case Role.ADMIN:
            statsData = getAdminStatsData();
            break;
        default:
            throw new AppError(status.BAD_REQUEST, "Invalid user role");
    }

    return statsData;
}

const getSuperAdminStatsData = async () => {
    const orderCount = await prisma.order.count();
    const productCount = await prisma.product.count();
    const customerCount = await prisma.customer.count();
    const superAdminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.SUPER_ADMIN
            }
        }
    });
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();
    const userCount = await prisma.user.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true},
        where:{
            status: PaymentStatus.PAID
        }
    });

    const pieChartData = await getPieChartData();
    const barChartData = await getBarChartData();
    const orderStatusData = await getOrderStatusData();
    const orderPaymentData = await getOrderPaymentData();

    return {
        orderCount,
        productCount,
        customerCount, 
        superAdminCount,  
        adminCount,
        paymentCount,
        userCount,
        totalRevenue: totalRevenue._sum?.amount || 0,
        pieChartData,
        barChartData,
        orderStatusData,
        orderPaymentData
    }
}

const getAdminStatsData = async () => {
        const orderCount = await prisma.order.count();
        const productCount = await prisma.product.count();
        const customerCount = await prisma.customer.count();
        const paymentCount = await prisma.payment.count();
        const userCount = await prisma.user.count();
        const adminCount = await prisma.admin.count();

        const totalRevenue = await prisma.payment.aggregate({
            _sum: { amount: true},
            where:{
                status: PaymentStatus.PAID
            }
        });

        const pieChartData = await getPieChartData();
        const barChartData = await getBarChartData();
        const orderStatusData = await getOrderStatusData();
        const orderPaymentData = await getOrderPaymentData();

        return {
            orderCount,
            productCount,
            customerCount,
            paymentCount,
            userCount,
            adminCount,
            totalRevenue: totalRevenue._sum?.amount || 0,
            pieChartData,
            barChartData,
            orderStatusData,
            orderPaymentData
        }
}

const getProductStatsData = async (productId: string) => {
    const productData = await prisma.product.findUniqueOrThrow({
        where: { id: productId }
    });

    const reviewCount = await prisma.review.count({
        where: { productId: productData.id }
    });

    // Count unique customers via orderItems — OrderItem links to variant which has productId
    const orderItems = await prisma.orderItem.findMany({
        where: { variant: { productId: productData.id } },
        select: { order: { select: { customerId: true } } }
    });
    const uniqueCustomerCount = new Set(orderItems.map(i => i.order.customerId)).size;

    const orderCount = await prisma.order.count({
        where: { orderItems: { some: { variant: { productId: productData.id } } } }
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            order: { orderItems: { some: { variant: { productId: productData.id } } } },
            status: PaymentStatus.PAID
        }
    });

    const orderStatusDist = await prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { orderItems: { some: { variant: { productId: productData.id } } } }
    });

    return {
        reviewCount,
        customerCount: uniqueCustomerCount,
        orderCount,
        totalRevenue: totalRevenue._sum?.amount || 0,
        orderStatusDistribution: orderStatusDist.map(({ _count, status }) => ({ status, count: _count.id }))
    };
}

const getCustomerStatsData = async (user : IRequestUser) => {
    const customerData = await prisma.customer.findFirstOrThrow({
        where: {
            user: { email: user.email }
        }
    });

    const orderCount = await prisma.order.count({
        where: {
            customerId: customerData.id
        }
    })

    const reviewCount = await prisma.review.count({
        where: {
            customerId: customerData.id
        }
    })

    const orderStatusDistribution = await prisma.order.groupBy({
        by: ["status"],
        _count: {
            id: true
        },
        where: {
            customerId: customerData.id
        }
    })

    const formattedorderStatusDistribution = orderStatusDistribution.map(({_count, status}) => ({
        status,
        count : _count.id
    }))

    return {
        orderCount,
        reviewCount,
        orderStatusDistribution: formattedorderStatusDistribution
    }
}

const getOrderStatusData = async () => {
    const data = await prisma.order.groupBy({
        by: ["status"],
        _count: { id: true }
    });

    return data.map(({ status, _count }) => ({ status, count: _count.id }));
};

const getOrderPaymentData = async () => {
    const data = await prisma.payment.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true }
    });

    return data.map(({ status, _count, _sum }) => ({
        status,
        count: _count.id,
        totalAmount: _sum.amount || 0
    }));
};

const getPieChartData = async () => {
    const orderStatusDistribution = await prisma.order.groupBy({
        by: ["status"],
        _count: {
            id: true
        }
    });

    const formattedorderStatusDistribution = orderStatusDistribution.map(({_count, status}) => ({
        status,
        count : _count.id
    }))

    return formattedorderStatusDistribution;
}

const getBarChartData = async () => {
    interface orderCountByMonth {
        month: Date;
        count: bigint;
    }
    const orderCountByMonth : orderCountByMonth[] = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "orders"
        GROUP BY month
        ORDER BY month ASC;
    `

    return orderCountByMonth
}


export const StatsService = {
    getDashboardStatsData,
    getProductStatsData,
    getCustomerStatsData,
    getOrderStatusData,
    getOrderPaymentData,
}