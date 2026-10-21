import { StaffApiService } from './../../../../../../libs/api/staff/staff.service';
import { inject, Injectable, signal } from '@angular/core';
import { InMemoryStore } from './in-memory-store';
import { StaffResponse } from '../../../../../../libs/models/staff/staff-response.model';
import { firstValueFrom } from 'rxjs';
import { StaffRequest } from '../../../../../../libs/models/staff/staff-request.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly staffApiService = inject(StaffApiService);

  // private writable state
  private readonly _items = signal<StaffResponse[]>([]);
  private readonly _error = signal(false);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  // public read-only state
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();

  // get all staff

  async load(): Promise<boolean> {
    this._error.set(false);
    this._loading.set(true);
    try {
      const staff = await firstValueFrom(this.staffApiService.getAllStaff());
      this._items.set(staff);
      return true;
    } catch (error) {
      console.error('Failed to load staff:', error);
      this._error.set(true);
      return false;
    } finally {
      this._loading.set(false);
    }
  }
  // create staff (backend sends the invitation email)
  async add(request: StaffRequest, imageFile: File | null = null): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      const created = await firstValueFrom(this.staffApiService.createStaff(request));
      let imageFailed = false;

      if (imageFile) {
        try {
          await firstValueFrom(this.staffApiService.uploadStaffImage(created.id, imageFile));
        } catch (error) {
          console.error('Staff created, but image upload failed:', error);
          imageFailed = true;
        }
      }
      await this.load();

      // staff exists either way, so return true to avoid duplicate creation on retry
      if (imageFailed) this._error.set(true);
      return true;
    } catch (error) {
      console.error('Failed to create staff:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // update staff

  async update(id: number, request: StaffRequest, imageFile: File | null = null): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      const current = this._items().find((s) => s.id === id);

      // 1. name + role
      await firstValueFrom(
        this.staffApiService.updateStaff(id, {
          fullName: request.fullName,
          email: request.email,
          roleId: request.roleId,
        }),
      );

      // 2. status is a toggle, so call it only if it changed
      if (current && request.isActive !== undefined && request.isActive !== current.isActive) {
        await firstValueFrom(this.staffApiService.changeStaffStatus(id));
      }

      // 3. image
      if (imageFile) {
        await firstValueFrom(this.staffApiService.uploadStaffImage(id, imageFile));
      }

      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to update staff:', error);
      await this.load();
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // activate / deactivate
  async changeStatus(id: number): Promise<boolean> {
    this._error.set(false);
    this._saving.set(true);
    try {
      await firstValueFrom(this.staffApiService.changeStaffStatus(id));
      await this.load();
      return true;
    } catch (error) {
      console.error('Failed to change staff status:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }

  // remove staff
  async remove(id: number): Promise<boolean> {
    this._saving.set(true);
    this._error.set(false);
    try {
      await firstValueFrom(this.staffApiService.deleteStaff(id));
      this._items.update((list) => list.filter((s) => s.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete staff:', error);
      this._error.set(true);
      return false;
    } finally {
      this._saving.set(false);
    }
  }
}
