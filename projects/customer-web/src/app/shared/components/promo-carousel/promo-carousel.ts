import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface PromoCard {
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl: string;
}

@Component({
  selector: 'app-promo-carousel',
  standalone: true,
  imports: [],
  templateUrl: './promo-carousel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoCarousel implements AfterViewInit, OnDestroy {
  // ============================================
  // PLATFORM
  // ============================================

  private readonly platformId = inject(PLATFORM_ID);

  // ============================================
  // SWIPER ELEMENT
  // ============================================

  @ViewChild('swiperContainer', { static: false })
  swiperContainer!: ElementRef<HTMLDivElement>;

  // ============================================
  // PROMOTION CARDS
  // ============================================

  cards: PromoCard[] = [
    {
      title: 'Free Upgrade with Visa',
      subtitle: 'Available for Visa Platinum or Infinite Cardholders',
      ctaLabel: 'Learn More',
      imageUrl: '/assets/images/promotion/pro-1.jpg',
    },

    {
      title: 'Matcha Series',
      subtitle: 'Discover our new iced matcha favorites',
      ctaLabel: 'Order Now',
      imageUrl: '/assets/images/promotion/pro-2.jpg',
    },

    {
      title: 'Special Rewards',
      subtitle: 'Exclusive double star points this week',
      ctaLabel: 'Explore',
      imageUrl: '/assets/images/promotion/pro-3.jpg',
    },
  ];

  // ============================================
  // ACTIVE SLIDE
  // ============================================

  activeIndex = signal(0);

  // ============================================
  // SWIPER INSTANCE
  // ============================================

  private swiper?: Swiper;

  // ============================================
  // AFTER VIEW INIT
  // ============================================

  ngAfterViewInit(): void {
    // IMPORTANT:
    // Swiper requires browser DOM APIs.
    //
    // Angular SSR executes this component on
    // the server as well, so don't initialize
    // Swiper there.

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initSwiper();
  }

  // ============================================
  // INIT SWIPER
  // ============================================

  private initSwiper(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.swiperContainer?.nativeElement) {
      return;
    }

    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Autoplay],

      // ========================================
      // MOBILE
      // ========================================

      slidesPerView: 1.15,
      spaceBetween: 16,

      // ========================================
      // RESPONSIVE
      // ========================================

      breakpoints: {
        // Tablet
        640: {
          slidesPerView: 1.6,
          spaceBetween: 20,
        },

        // Desktop
        1024: {
          slidesPerView: 2.2,
          spaceBetween: 24,
        },
      },

      // Only 3 cards.
      // Don't use loop.
      loop: false,

      speed: 700,

      // ========================================
      // AUTOPLAY
      // ========================================

      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      allowTouchMove: true,
      grabCursor: true,

      // ========================================
      // EVENTS
      // ========================================

      on: {
        init: (swiper) => {
          this.activeIndex.set(swiper.activeIndex);
        },

        slideChange: (swiper) => {
          this.activeIndex.set(swiper.activeIndex);
        },

        reachEnd: (swiper) => {
          // Restart from first slide after
          // reaching the last slide.

          setTimeout(() => {
            if (!this.swiper) {
              return;
            }

            if (!isPlatformBrowser(this.platformId)) {
              return;
            }

            swiper.slideTo(0, 700);
          }, 4000);
        },
      },
    });
  }

  // ============================================
  // GO TO SLIDE
  // ============================================

  goToSlide(index: number): void {
    if (!this.swiper) {
      return;
    }

    this.swiper.slideTo(index, 700);
  }

  // ============================================
  // PREVIOUS
  // ============================================

  goPrev(): void {
    if (!this.swiper) {
      return;
    }

    this.swiper.slidePrev();
  }

  // ============================================
  // NEXT
  // ============================================

  goNext(): void {
    if (!this.swiper) {
      return;
    }

    this.swiper.slideNext();
  }

  // ============================================
  // DESTROY
  // ============================================

  ngOnDestroy(): void {
    // IMPORTANT:
    // Don't call Swiper.destroy() during SSR.
    //
    // Swiper.destroy() internally accesses
    // document, which doesn't exist on the server.

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
  }
}
