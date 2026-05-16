export interface ICreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    contactNumber?: string;
  };
}
