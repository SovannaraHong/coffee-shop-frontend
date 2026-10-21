// export interface VariantRequest {
//   id?: number;
//   name: string;
//   price: number;
//   sku: string;
//   isActive?: boolean;
// }
export interface VariantRequest {
  id?: number;
  name: string;
  price: number;
  sku?: string | null;
  isActive?: boolean;
}
