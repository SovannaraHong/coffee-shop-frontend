import { Injectable } from '@angular/core';
import { Staff } from '../models/staff';
import { STAFF } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class StaffService extends InMemoryStore<Staff> {
  constructor() {
    super(STAFF);
  }
}
