import { ProductResponse } from './../../../../../../../libs/models/product/product-response.model';
import { Component, computed, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<ProductResponse>();
  readonly isFavorite = input(false);

  readonly toggleFavorite = output<number>();
  readonly addToCart = output<number>();

  // Picks the cheapest active variant to display as the card's price.
  // Adjust this if you actually want a specific "default" variant instead.
  readonly displayVariant = computed(() => {
    const activeVariants = this.product().variants.filter((v) => v.isActive);
    if (activeVariants.length === 0) return null;
    return activeVariants.reduce((min, v) => (v.price < min.price ? v : min), activeVariants[0]);
  });

  readonly hasMultipleVariants = computed(
    () => this.product().variants.filter((v) => v.isActive).length > 1,
  );

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.product().id);
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product().id);
  }
}
