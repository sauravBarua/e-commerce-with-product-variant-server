import status from "http-status";
import { OrderStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateOrderPayload, IUpdateOrderStatusPayload } from "./order.interface";

const orderInclude = {
  orderItems: {
    include: {
      variant: {
        include: {
          colorGroup: {
            include: {
              product: { select: { id: true, name: true } },
              images: { take: 1 },
            },
          },
          attributes: true,
        },
      },
    },
  },
  address: true,
  customer: { select: { id: true, name: true, user: { select: { email: true } } } },
};

const createOrder = async (user: IRequestUser, payload: ICreateOrderPayload) => {
  const { items, addressId } = payload;

  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) {
    throw new AppError(status.NOT_FOUND, "Customer profile not found");
  }

  if (addressId) {
    const addressExists = await prisma.address.findFirst({
      where: { id: addressId, userId: user.userId },
    });
    if (!addressExists) {
      throw new AppError(status.NOT_FOUND, "Address not found");
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const variantPrices = new Map<string, number>();
    let totalAmount = 0;

    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { inventory: true },
      });

      if (!variant) {
        throw new AppError(status.NOT_FOUND, `Variant ${item.variantId} not found`);
      }

      if (!variant.inventory) {
        throw new AppError(status.CONFLICT, `Variant ${item.variantId} has no inventory record`);
      }

      const available = variant.inventory.quantity - variant.inventory.reservedQuantity;
      if (available < item.quantity) {
        throw new AppError(
          status.CONFLICT,
          `Insufficient stock for variant ${item.variantId}. Available: ${available}`,
        );
      }

      variantPrices.set(item.variantId, Number(variant.price));
      totalAmount += Number(variant.price) * item.quantity;
    }

    const newOrder = await tx.order.create({
      data: {
        customerId: customer.id,
        addressId: addressId ?? null,
        totalAmount,
        orderItems: {
          create: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtOrder: variantPrices.get(item.variantId)!,
          })),
        },
      },
      include: orderInclude,
    });

    for (const item of items) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: { reservedQuantity: { increment: item.quantity } },
      });
    }

    return newOrder;
  });

  return order;
};

const getMyOrders = async (user: IRequestUser, queryParams: IQueryParams) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) {
    throw new AppError(status.NOT_FOUND, "Customer profile not found");
  }

  const result = await new QueryBuilder(prisma.order, queryParams, {})
    .filter()
    .sort()
    .paginate()
    .execute({ where: { customerId: customer.id }, include: orderInclude });

  return result;
};

const getAllOrders = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.order, queryParams, {})
    .filter()
    .sort()
    .paginate()
    .execute({ include: orderInclude });

  return result;
};

const getOrderById = async (id: string, user: IRequestUser) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  if (user.role === "CUSTOMER" && order.customer.user.email !== user.email) {
    throw new AppError(status.FORBIDDEN, "Access denied");
  }

  return order;
};

const updateOrderStatus = async (id: string, payload: IUpdateOrderStatusPayload) => {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: payload.status },
      include: orderInclude,
    });

    if (payload.status === OrderStatus.DELIVERED) {
      for (const item of updated.orderItems) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            reservedQuantity: { decrement: item.quantity },
            quantity: { decrement: item.quantity },
          },
        });
      }
    }

    if (payload.status === OrderStatus.CANCELLED) {
      for (const item of updated.orderItems) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reservedQuantity: { decrement: item.quantity } },
        });
      }
    }

    return updated;
  });

  return order;
};

const cancelOrder = async (id: string, user: IRequestUser) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: { include: { user: { select: { email: true } } } }, orderItems: true },
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  if (order.customer.userId !== user.userId) {
    throw new AppError(status.FORBIDDEN, "Access denied");
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new AppError(status.BAD_REQUEST, "Only pending orders can be cancelled");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    for (const item of order.orderItems) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: { reservedQuantity: { decrement: item.quantity } },
      });
    }
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
