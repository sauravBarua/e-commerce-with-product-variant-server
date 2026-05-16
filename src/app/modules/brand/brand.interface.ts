export interface ICreateBrandPayload {
  name: string;
  logo?: string;
  isActive?: boolean;
}

export interface IUpdateBrandPayload {
  name?: string;
  logo?: string;
  isActive?: boolean;
}
