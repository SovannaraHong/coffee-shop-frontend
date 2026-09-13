import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { ProductResponse } from '../../../../../../../libs/models/product/product-response.model';

@Component({
  selector: 'app-promo-carousel',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './promo-carousel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoCarousel {
  readonly title = input.required<string>();
  readonly products = input.required<ProductResponse[]>();
  readonly favoriteIds = input<number[]>([]);

  readonly toggleFavorite = output<number>();
  readonly addToCart = output<number>();

  private readonly scrollTrack = viewChild.required<ElementRef<HTMLDivElement>>('scrollTrack');

  isFavorite(id: number): boolean {
    return this.favoriteIds().includes(id);
  }

  scroll(direction: 'left' | 'right'): void {
    const el = this.scrollTrack().nativeElement;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }
}
