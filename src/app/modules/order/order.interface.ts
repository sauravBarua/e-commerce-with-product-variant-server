import { OrderStatus } from "../../../generated/prisma/enums";

export interface IOrderItem {
  variantId: string;
  quantity: number;
}

export interface ICreateOrderPayload {
  items: IOrderItem[];
  addressId?: string;
}

export interface IUpdateOrderStatusPayload {
  status: OrderStatus;
}
