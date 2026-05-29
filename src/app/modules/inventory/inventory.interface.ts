export interface IUpdateInventoryPayload {
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  warehouseLocation?: string;
}

export interface IAddQuantityPayload {
  quantity: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  warehouseLocation?: string;
}
