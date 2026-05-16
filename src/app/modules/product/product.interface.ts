export interface IProductSpecificationInput {
  group: string;
  key: string;
  value: string;
}

export interface IProductVariantAttributeInput {
  key: string;
  value: string;
}

export interface ICreateVariantInput {
  sku?: string;
  price: number;
  attributes: IProductVariantAttributeInput[];
}

export interface ICreateProductPayload {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  isActive?: boolean;
  specifications?: IProductSpecificationInput[];
  variants: ICreateVariantInput[];
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface IUpdateVariantPayload {
  sku?: string;
  price?: number;
  attributes?: IProductVariantAttributeInput[];
}

