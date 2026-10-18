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
import { CategoryRequest } from '../../../../../../../libs/models/category/category-request.model';
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

  readonly open = input(false);
  readonly category = input<CategoryResponse | null>(null);

  readonly closed = output<void>();
  readonly saved = output<CategoryRequest>();

  protected readonly mounted = signal(false);
  protected readonly shown = signal(false);

  protected imagePreview: string | null = null;
  protected imageName = '';

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  constructor() {
    this.doc.body.appendChild(this.host.nativeElement);
    inject(DestroyRef).onDestroy(() => this.host.nativeElement.remove());

    effect(() => {
      if (this.open()) {
        const c = this.category();
        untracked(() => {
          this.load(c);
          this.mounted.set(true);
          requestAnimationFrame(() => requestAnimationFrame(() => this.shown.set(true)));
        });
      } else {
        untracked(() => this.shown.set(false));
      }
    });
  }

  private load(c: CategoryResponse | null): void {
    if (c) {
      this.form.reset({ name: c.name, description: c.description ?? '', isActive: c.isActive });
      this.imagePreview = c.image ?? null;
      this.imageName = c.image ?? '';
    } else {
      this.form.reset({ name: '', description: '', isActive: true });
      this.imagePreview = null;
      this.imageName = '';
    }
    this.form.markAsUntouched();
  }

  protected onImage(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.imagePreview = file ? URL.createObjectURL(file) : null;
    this.imageName = file?.name ?? '';
  }

  protected removeImage(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.imagePreview = null;
    this.imageName = '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      name: v.name,
      description: v.description,
      isActive: v.isActive,
      image: this.imageName || undefined,
    });
  }
}
