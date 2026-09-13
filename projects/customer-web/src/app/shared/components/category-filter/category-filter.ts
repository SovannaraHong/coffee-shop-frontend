import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

export const ALL_CATEGORY = 'All';

@Component({
  imports: [NgClass],
  selector: 'app-category-filter',
  styleUrl: './category-filter.css',
  templateUrl: './category-filter.html',
  standalone: true,
})
export class CategoryFilter {
  readonly categories = input.required<string[]>();
  readonly activeCategory = input<string>('');
  readonly categorySelected = output<string>();

  readonly ALL = ALL_CATEGORY;

  select(category: string): void {
    this.categorySelected.emit(category);
  }
}
