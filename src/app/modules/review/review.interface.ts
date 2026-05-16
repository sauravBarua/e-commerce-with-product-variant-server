export interface ICreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}
