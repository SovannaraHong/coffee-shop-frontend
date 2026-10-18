export type InventoryCategory = 'Beans' | 'Dairy' | 'Syrups' | 'Packaging' | 'Bakery' | 'Other';
export type StockStatus = 'In stock' | 'Low stock' | 'Out of stock';

export const INVENTORY_CATEGORIES: InventoryCategory[] = ['Beans', 'Dairy', 'Syrups', 'Packaging', 'Bakery', 'Other'];
export const INVENTORY_UNITS = ['kg', 'L', 'pcs', 'bottles', 'bags'];

export interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  reorderLevel: number;
  supplierId: number;
  costPerUnit: number;
  lastRestocked: string;
}

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return 'Out of stock';
  if (item.quantity <= item.reorderLevel) return 'Low stock';
  return 'In stock';
}
