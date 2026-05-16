export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IRegistercustomerPayload {
  name: string;
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfilePayload {
  name?: string;
  contactNumber?: string;
  image?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
