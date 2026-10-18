import { CustomerUpdateRequest } from './../../../../../../libs/models/customer/customer-request.model';
import { CustomerResponse } from './../../../../../../libs/models/customer/customer-response.model';
import { Injectable, signal } from '@angular/core';

// Sample data. Replace the method bodies with HttpClient calls when your API is ready.
const SEED: CustomerResponse[] = [
  {
    id: 1,
    firstName: 'Sok',
    lastName: 'Dara',
    email: 'sok.dara@mail.example',
    phone: '012 345 678',
    avatarUrl: '',
    isVerified: true,
    isActive: true,
  },
  {
    id: 2,
    firstName: 'Chan',
    lastName: 'Sreyneang',
    email: 'sreyneang@mail.example',
    phone: '096 222 3344',
    avatarUrl: '',
    isVerified: true,
    isActive: true,
  },
  {
    id: 3,
    firstName: 'Vannak',
    lastName: 'Phal',
    email: 'vannak.p@mail.example',
    phone: '077 889 910',
    avatarUrl: '',
    isVerified: false,
    isActive: false,
  },
  {
    id: 4,
    firstName: 'Charlotte',
    lastName: 'Clark',
    email: 'charlotte.c@mail.example',
    phone: '',
    avatarUrl: '',
    isVerified: true,
    isActive: true,
  },
  {
    id: 5,
    firstName: 'Liam',
    lastName: 'Walker',
    email: 'liam.w@mail.example',
    phone: '010 555 0101',
    avatarUrl: '',
    isVerified: false,
    isActive: true,
  },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly data = signal<CustomerResponse[]>(SEED);
  readonly items = this.data.asReadonly();

  update(id: number, v: CustomerUpdateRequest): void {
    this.data.update((list) => list.map((x) => (x.id === id ? { ...x, ...v } : x)));
  }

  setActive(id: number, isActive: boolean): void {
    this.data.update((list) => list.map((x) => (x.id === id ? { ...x, isActive } : x)));
  }
}
