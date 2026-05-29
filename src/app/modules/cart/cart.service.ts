import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IAddToCartPayload, IUpdateCartItemPayload } from "./cart.interface";

const cartItemInclude = {
  variant: {
    include: {
      attributes: true,
      inventory: { select: { quantity: true, reservedQuantity: true } },
      colorGroup: {
        include: {
          images: { take: 1 },
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  },
} as const;

const getOrCreateCart = async (customerId: string) => {
  return prisma.cart.upsert({
    where: { customerId },
    update: {},
    create: { customerId },
    include: { items: { include: cartItemInclude } },
  });
};

const addToCart = async (user: IRequestUser, payload: IAddToCartPayload) => {
  const { variantId, quantity } = payload;

  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true },
  });
  if (!variant) throw new AppError(status.NOT_FOUND, "Product variant not found");

  if (!variant.inventory || variant.inventory.quantity < quantity) {
    throw new AppError(status.BAD_REQUEST, "Insufficient stock for requested quantity");
  }

  const cart = await prisma.cart.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (variant.inventory.quantity < newQuantity) {
    throw new AppError(
      status.BAD_REQUEST,
      `Only ${variant.inventory.quantity} unit(s) available`,
    );
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, variantId, quantity },
  });

  return getOrCreateCart(customer.id);
};

const getMyCart = async (user: IRequestUser) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  return getOrCreateCart(customer.id);
};

const updateCartItem = async (
  user: IRequestUser,
  cartItemId: string,
  payload: IUpdateCartItemPayload,
) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, variant: { include: { inventory: true } } },
  });
  if (!cartItem) throw new AppError(status.NOT_FOUND, "Cart item not found");
  if (cartItem.cart.customerId !== customer.id)
    throw new AppError(status.FORBIDDEN, "This cart item does not belong to you");

  if (!cartItem.variant.inventory || cartItem.variant.inventory.quantity < payload.quantity) {
    throw new AppError(
      status.BAD_REQUEST,
      `Only ${cartItem.variant.inventory?.quantity ?? 0} unit(s) available`,
    );
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: payload.quantity },
  });

  return getOrCreateCart(customer.id);
};

const removeCartItem = async (user: IRequestUser, cartItemId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!cartItem) throw new AppError(status.NOT_FOUND, "Cart item not found");
  if (cartItem.cart.customerId !== customer.id)
    throw new AppError(status.FORBIDDEN, "This cart item does not belong to you");

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return getOrCreateCart(customer.id);
};

const clearCart = async (user: IRequestUser) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });
  if (!customer) throw new AppError(status.NOT_FOUND, "Customer profile not found");

  const cart = await prisma.cart.findUnique({ where: { customerId: customer.id } });
  if (!cart) throw new AppError(status.NOT_FOUND, "Cart not found");

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return getOrCreateCart(customer.id);
};

export const CartService = {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
