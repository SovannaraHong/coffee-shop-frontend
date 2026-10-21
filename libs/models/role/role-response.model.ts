export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  permissions: PermissionResponse[];
}
