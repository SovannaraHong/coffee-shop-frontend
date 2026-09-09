import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Feature {
  icon: SafeHtml;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [],
  templateUrl: './hero-banner.html',
})
export class HeroBanner implements OnInit, OnDestroy {
  features: Feature[];

  images: string[] = [
    '/assets/images/hero-banner-1.jpeg',
    '/assets/images/hero-banner-2.jpg',
     '/assets/images/hero-banner-3.jpeg',
      '/assets/images/hero-banner-4.jpg',
  ];

  // Signal instead of a plain property
  activeIndex = signal(0);

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(private sanitizer: DomSanitizer) {
    this.features = [
      {
        icon: this.trust(`<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`),
        title: 'Freshly Brewed Coffee',
        desc: 'Made with premium quality beans',
      },
      {
        icon: this.trust(`<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 2v7c0 1 1 2 2 2s2-1 2-2V2M5 11v11M15 2v20M19 2c-2 0-4 2-4 6s2 6 4 6"/></svg>`),
        title: 'Delicious Food Options',
        desc: 'From breakfast to dessert & more',
      },
      {
        icon: this.trust(`<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/></svg>`),
        title: 'Cozy Ambient Space',
        desc: 'Perfect place to relax, work or meet',
      },
      {
        icon: this.trust(`<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01"/></svg>`),
        title: 'Free WiFi Available',
        desc: 'Stay connected while you sip & relax',
      },
    ];
  }

  ngOnInit(): void {
    if (this.images.length <= 1) return; // nothing to rotate
    this.timer = setInterval(() => {
      this.activeIndex.update((i) => (i + 1) % this.images.length);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private trust(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
