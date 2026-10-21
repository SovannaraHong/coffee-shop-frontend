export interface RoleRequest {
  name: string;
  permissionIds: number[];
}

export type RolePayload = RoleRequest;
