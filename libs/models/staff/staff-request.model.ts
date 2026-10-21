export interface StaffRequest {
  fullName: string;
  email: string;
  roleId: number;
  isActive?: boolean; // only used when editing
}
