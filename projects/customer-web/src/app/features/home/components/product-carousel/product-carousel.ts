import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
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
  imports: [],
  selector: 'app-product-carousel',
  templateUrl: './product-carousel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCarousel implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

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
      imageUrl: '/assets/images/promotion/pro-1.webp',
    },
    {
      title: 'Matcha Series',
      subtitle: 'Discover our new iced matcha favorites',
      ctaLabel: 'Order Now',
      imageUrl: '/assets/images/promotion/pro-2.webp',
    },
    {
      title: 'Special Rewards',
      subtitle: 'Exclusive double star points this week',
      ctaLabel: 'Explore',
      imageUrl: '/assets/images/promotion/pro-3.webp',
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

    // ========================================
    // IMPORTANT: run outside Angular's zone
    // ========================================
    //
    // Swiper triggers a LOT of internal work on
    // touchmove / rAF / autoplay ticks. If this
    // runs inside Angular's zone, Zone.js patches
    // fire change detection on every single one
    // of those events across the WHOLE app tree,
    // not just this component. That's usually the
    // real cause of "slow swiper" in Angular apps.
    //
    // We only re-enter the zone (via ngZone.run)
    // when we actually need to update component
    // state that the template reads (activeIndex).

    this.ngZone.runOutsideAngular(() => {
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

        // ========================================
        // LOOP
        // ========================================
        //
        // Use Swiper's native loop instead of a
        // manual reachEnd -> setTimeout -> slideTo(0)
        // hack. Native loop runs on Swiper's own
        // internal transition engine, so it doesn't
        // race with autoplay's timer or stack up
        // stray setTimeout calls if the user swipes
        // back and forth near the last slide.

        loop: true,

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
            this.ngZone.run(() => {
              this.activeIndex.set(swiper.realIndex);
            });
          },

          slideChange: (swiper) => {
            this.ngZone.run(() => {
              // realIndex accounts for the duplicated
              // slides that loop mode creates internally
              this.activeIndex.set(swiper.realIndex);
            });
          },
        },
      });
    });
  }

  // ============================================
  // GO TO SLIDE
  // ============================================

  goToSlide(index: number): void {
    if (!this.swiper) {
      return;
    }

    this.swiper.slideToLoop(index, 700);
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
