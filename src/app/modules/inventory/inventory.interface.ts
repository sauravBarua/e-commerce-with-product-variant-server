export interface IUpdateInventoryPayload {
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  warehouseLocation?: string;
}
