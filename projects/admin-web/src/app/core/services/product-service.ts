import { inject, Injectable, signal } from '@angular/core';
import { ProductApiService } from '../../../../../../libs/api/product/product.service';
import { ProductResponse } from '../../../../../../libs/models/product/product-response.model';
import { firstValueFrom } from 'rxjs';
import { ProductPaginationParams } from '../../../../../../libs/models/product/product.model';
import { PageResponse } from '../../../../../../libs/models/common/page-response.model';
import { ProductRequest } from '../../../../../../libs/models/product/product-request.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productApiService = inject(ProductApiService);

  //private writable state
  private readonly _items = signal<ProductResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  // Public read-only state

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  //get all product
  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      const product = await firstValueFrom(this.productApiService.getAllProducts());

      this._items.set(product);
      return true;
    } catch (error) {
      console.error('Failed to load products:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }
  //get product with pagination

  async loadPage(params: ProductPaginationParams): Promise<PageResponse<ProductResponse> | null> {
    this._loading.set(true);
    this._error.set(false);

    try {
      return await firstValueFrom(this.productApiService.getProducts(params));
    } catch (error) {
      console.error('Failed to load paginated products:', error);
      this._error.set(true);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  //get product by id
  async getById(id: number): Promise<ProductResponse | null> {
    this._error.set(false);
    try {
      return await firstValueFrom(this.productApiService.getProductById(id));
    } catch (error) {
      console.error('Failed to get product:', error);
      this._error.set(true);
      return null;
    }
  }
  async add(request: ProductRequest, imageFile: File | null = null): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      // Step 1: create product
      const created = await firstValueFrom(this.productApiService.createProduct(request));

      // Step 2: upload image if one was selected
      let imageFailed = false;
      if (imageFile) {
        try {
          await firstValueFrom(this.productApiService.uploadProductImage(created.id, imageFile));
        } catch (error) {
          console.error('Product created, but image upload failed:', error);
          imageFailed = true;
        }
      }

      // Step 3: refresh list
      await this.load();

      // Product exists either way, so return true to avoid duplicate creation on retry.
      if (imageFailed) this._error.set(true);
      return true;
    } catch (error) {
      console.error('Failed to create product:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  //update product
  async update(
    id: number,
    request: ProductRequest,
    imageFile: File | null = null,
  ): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      //step 1 update product
      await firstValueFrom(this.productApiService.updateProduct(id, request));
      //step 2 upload image if select
      if (imageFile) {
        await firstValueFrom(this.productApiService.uploadProductImage(id, imageFile));
      }
      //step 3 refresh product list
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to update product:', error);
      await this.load();
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  //remove product
  async remove(id: number): Promise<boolean> {
    this._saving.set(true);
    this._error.set(false);
    try {
      await firstValueFrom(this.productApiService.deleteProduct(id));
      //remove deleted product from local state
      this._items.update((products) => products.filter((product) => product.id !== id));

      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
  //change status product
  async changeStatus(id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.productApiService.changeProductStatus(id));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to change product status:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
  async changeFeature(id: number): Promise<ProductResponse | null> {
    this._error.set(false);
    this._saving.set(true);

    try {
      const updatedProduct = await firstValueFrom(this.productApiService.changeProductFeature(id));

      await this.load();

      return updatedProduct;
    } catch (error) {
      console.error('Failed to change product feature:', error);
      this._error.set(true);
      return null;
    } finally {
      this._saving.set(false);
    }
  }

  //Upload product image
  async uploadImage(id: number, file: File): Promise<boolean> {
    this._saving.set(true);
    this._error.set(false);

    try {
      await firstValueFrom(this.productApiService.uploadProductImage(id, file));

      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to upload product image:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
