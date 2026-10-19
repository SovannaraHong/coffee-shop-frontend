import { CategoryResponse } from './../../../../../../../libs/models/category/category-response.model';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CategoryFormSubmit,
  CategoryRequest,
} from '../../../../../../../libs/models/category/category-request.model';
import { every } from 'rxjs';
// Adjust these two paths to your tsconfig alias or relative location of libs/models

@Component({
  selector: 'app-category-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './category-drawer.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class CategoryDrawer {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly category = input<CategoryResponse | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<CategoryFormSubmit>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected imagePreview: string | null = null;
  protected selectedImage: File | null = null;
  private imageObjectUrl: string | null = null;

  protected form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    isActive: [true],
  });

  constructor() {
    this.doc.body.appendChild(this.host.nativeElement);
    this.destroyRef.onDestroy(() => {
      this.revokePreview();
      this.host.nativeElement.remove();
    });

    effect(() => {
      const isOpen = this.open();
      const category = this.category();
      untracked(() => {
        if (isOpen) {
          this.load(category);
          this.mounted.set(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => this.shown.set(true));
          });
        } else {
          this.shown.set(false);
        }
      });
    });
  }

  private load(c: CategoryResponse | null): void {
    this.revokePreview();
    this.selectedImage = null;
    this.imagePreview = c?.imageUrl ?? null;

    this.form.reset({
      name: c?.name ?? '',
      description: c?.description ?? '',
      isActive: c?.isActive ?? true,
    });
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  protected onImage(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      input.value = '';
      return;
    }

    this.revokePreview();

    this.selectedImage = file;
    this.imageObjectUrl = URL.createObjectURL(file);
    this.imagePreview = this.imageObjectUrl;
  }

  protected removeImage(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    this.revokePreview();
    this.selectedImage = null;
    this.imagePreview = null;
  }

  private revokePreview(): void {
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
      this.imageObjectUrl = null;
    }
  }

  protected onEscape(): void {
    if (this.open() && !this.saving()) {
      this.closed.emit();
    }
  }

  protected submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();

    this.saved.emit({
      request: {
        name: value.name.trim(),
        description: value.description.trim(),
        isActive: value.isActive,
      },
      imageFile: this.selectedImage,
    });
  }
}
