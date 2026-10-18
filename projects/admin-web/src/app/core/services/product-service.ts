import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { PRODUCTS } from '../data/mock-data';
import { InMemoryStore } from './in-memory-store';

@Injectable({ providedIn: 'root' })
export class ProductService extends InMemoryStore<Product> {
  constructor() {
    super(PRODUCTS);
  }
}
