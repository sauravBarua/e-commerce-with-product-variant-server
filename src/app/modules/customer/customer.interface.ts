export interface IUpdateCustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IUpdateCustomerPayload {
  name?: string;
  contactNumber?: string;
  address?: IUpdateCustomerAddress;
}
