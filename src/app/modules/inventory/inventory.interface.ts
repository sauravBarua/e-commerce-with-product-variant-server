export interface ICreateInventoryPayload {
  productId: string;
  quantity: number;
  lowStockThreshold?: number;
  sku?: string;
  warehouseLocation?: string;
}

export interface IUpdateInventoryPayload {
  quantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  warehouseLocation?: string;
}
