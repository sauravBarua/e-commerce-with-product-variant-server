export interface ICreateAddressPayload {
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IUpdateAddressPayload {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
