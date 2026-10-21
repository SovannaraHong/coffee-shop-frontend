import { PermissionResponse } from '../permission/permission-response.model';

export interface RoleResponse {
  id: number;
  name: string;
  permissions: PermissionResponse[];
}
