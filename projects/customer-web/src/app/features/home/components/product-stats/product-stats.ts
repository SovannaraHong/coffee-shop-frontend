import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  bg: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-product-stats',
  standalone: true,
  imports: [CommonModule],   // <-- this was likely missing or still []
  templateUrl: './product-stats.html',
})
export class ProductStats {
  features: Feature[] = [
    { icon: '☕', bg: 'bg-[#f3e6d8]', title: 'Freshly Brewed Coffee', desc: 'Made with premium quality beans' },
    { icon: '🍽️', bg: 'bg-[#fbe4e4]', title: 'Delicious Food Options', desc: 'From breakfast to dessert & more' },
    { icon: '🛋️', bg: 'bg-[#e0eefb]', title: 'Cozy Ambient Space', desc: 'Perfect place to relax, work or meet' },
    { icon: '📶', bg: 'bg-[#fdead0]', title: 'Free WiFi Available', desc: 'Stay connected while you sip & relax' },
  ];
}
