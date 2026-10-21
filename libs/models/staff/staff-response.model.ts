export interface StaffResponse {
  id: number;
  fullName: string;
  email: string;
  roleName: string;
  avatarUrl: string | null;
  isActive: boolean;
}
