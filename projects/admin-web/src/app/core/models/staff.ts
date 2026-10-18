export type StaffRole = 'Manager' | 'Barista' | 'Cashier' | 'Waiter';
export type StaffShift = 'Morning' | 'Evening' | 'Full day';
export type StaffStatus = 'Active' | 'On leave' | 'Inactive';

export const STAFF_ROLES: StaffRole[] = ['Manager', 'Barista', 'Cashier', 'Waiter'];
export const STAFF_SHIFTS: StaffShift[] = ['Morning', 'Evening', 'Full day'];
export const STAFF_STATUSES: StaffStatus[] = ['Active', 'On leave', 'Inactive'];

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  shift: StaffShift;
  status: StaffStatus;
  joinedAt: string;
  avatar: string;
}
