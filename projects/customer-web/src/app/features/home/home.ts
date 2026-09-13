import { Component } from '@angular/core';
import { HeroBanner } from './components/hero-banner/hero-banner';
import { ProductStats } from './components/product-stats/product-stats';
import { PromoStrip } from './components/promo-strip/promo-strip';
import { PromoCarousel } from '../../shared/components/promo-carousel/promo-carousel';
import { ProductCarousel } from './components/product-carousel/product-carousel';
import { Menu } from '../menu/menu/menu';

@Component({
  imports: [HeroBanner, ProductStats, ProductCarousel, Menu],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
