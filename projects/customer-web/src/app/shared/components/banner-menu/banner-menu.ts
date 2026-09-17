import { Component } from '@angular/core';
import { Menu } from '../../../features/menu/menu/menu';

@Component({
  imports: [Menu],
  selector: 'app-banner-menu',
  styleUrl: './banner-menu.css',
  templateUrl: './banner-menu.html',
})
export class BannerMenu {}
