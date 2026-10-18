import { Injectable } from '@angular/core';
import { Supplier } from '../models/supplier';
import { SUPPLIERS } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class SupplierService extends InMemoryStore<Supplier> {
  constructor() {
    super(SUPPLIERS);
  }
}
