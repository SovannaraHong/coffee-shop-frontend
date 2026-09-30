import { Component, signal } from '@angular/core';

interface Province {
  name: string;
  points: string;
  fill: string;
  lx: number;
  ly: number;
  label: string[];
}

interface ShopLocation {
  id: number;
  name: string;
  address: string;
  hours: string;
  phone: string;
  mapUrl: string;
  // pin tip position on the map (viewBox 0 0 440 330)
  x: number;
  y: number;
}

// Teal shades, same look as your reference map
const D = '#0e7f96'; // dark
const M = '#2f9db1'; // medium
const L = '#5fb8c6'; // light
const XL = '#9ad0da'; // lighter
const XXL = '#c8e5ec'; // lightest

@Component({
  imports: [],
  selector: 'app-location',
  styleUrl: './location.css',
  templateUrl: './location.html',
})
export class Location {
  active = signal(1);

  // ---- EDIT THESE: your real shops ----
  locations: ShopLocation[] = [
    {
      id: 1,
      name: 'Brewista Siem Reap',
      address: 'Street 9, Old Market Area, Siem Reap',
      hours: 'Open daily, 6:30 AM - 9:00 PM',
      phone: '+855 12 345 678',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Siem+Reap+Old+Market',
      x: 180,
      y: 116,
    },
    {
      id: 2,
      name: 'Brewista Phnom Penh',
      address: 'Riverside, Sisowath Quay, Phnom Penh',
      hours: 'Open daily, 6:30 AM - 10:00 PM',
      phone: '+855 12 345 679',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sisowath+Quay+Phnom+Penh',
      x: 212,
      y: 240,
    },
    {
      id: 3,
      name: 'Brewista Battambang',
      address: 'Street 2, Near the Riverside, Battambang',
      hours: 'Open daily, 7:00 AM - 9:00 PM',
      phone: '+855 12 345 680',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Battambang+City',
      x: 86,
      y: 142,
    },
  ];

  select(id: number) {
    this.active.set(id);
  }

  pinTransform(l: ShopLocation): string {
    const scale = this.active() === l.id ? 0.95 : 0.75;
    return `translate(${l.x} ${l.y}) scale(${scale})`;
  }

  // Country outline (used as a clip so province edges stay clean)
  outline =
    'M55 105 L75 95 L95 75 L100 55 L130 48 L190 45 L215 52 L265 58 L285 70 L300 60 L330 62 ' +
    'L358 50 L388 45 L386 62 L372 82 L362 105 L372 122 L380 130 L365 165 L340 195 L318 208 ' +
    'L312 218 L290 225 L296 255 L296 268 L270 272 L245 265 L232 285 L215 288 L195 292 ' +
    'L172 300 L160 292 L145 290 L130 293 L112 290 L105 272 L92 250 L90 225 L98 210 L88 195 ' +
    'L78 180 L70 160 L58 155 L58 130 Z';

  // Simple province shapes. Drawn in order, later ones sit on top.
  provinces: Province[] = [
    {
      name: 'Oddar Meanchey',
      points: '90,40 200,40 195,88 150,90 110,90 92,75',
      fill: D,
      lx: 145,
      ly: 64,
      label: ['Oddar Meanchey'],
    },
    {
      name: 'Preah Vihear',
      points: '195,40 290,50 285,100 262,118 200,112 190,88',
      fill: M,
      lx: 234,
      ly: 92,
      label: ['Preah Vihear'],
    },
    {
      name: 'Stung Treng',
      points: '285,50 340,55 335,105 300,110 275,100',
      fill: D,
      lx: 306,
      ly: 92,
      label: ['Stung Treng'],
    },
    {
      name: 'Ratanakiri',
      points: '335,40 395,40 385,80 365,110 335,108',
      fill: D,
      lx: 358,
      ly: 102,
      label: ['Ratanakiri'],
    },
    {
      name: 'Banteay Meanchey',
      points: '45,95 110,88 122,110 90,122 60,125 45,115',
      fill: M,
      lx: 86,
      ly: 98,
      label: ['Banteay', 'Meanchey'],
    },
    {
      name: 'Siem Reap',
      points: '120,92 192,88 200,112 168,122 125,120',
      fill: L,
      lx: 140,
      ly: 105,
      label: ['Siem Reap'],
    },
    {
      name: 'Battambang',
      points: '68,120 128,120 140,160 108,180 68,168',
      fill: D,
      lx: 112,
      ly: 152,
      label: ['Battambang'],
    },
    {
      name: 'Pailin',
      points: '55,132 72,128 74,158 55,158',
      fill: XL,
      lx: 63,
      ly: 146,
      label: ['Pailin'],
    },
    {
      name: 'Kampong Thom',
      points: '190,112 262,118 268,170 222,178 190,165 175,140',
      fill: M,
      lx: 232,
      ly: 150,
      label: ['Kampong Thom'],
    },
    {
      name: 'Kratie',
      points: '262,118 310,110 322,168 290,180 268,170',
      fill: L,
      lx: 292,
      ly: 148,
      label: ['Kratie'],
    },
    {
      name: 'Mondulkiri',
      points: '310,110 385,108 385,150 350,200 320,210 322,168',
      fill: XL,
      lx: 350,
      ly: 160,
      label: ['Mondulkiri'],
    },
    {
      name: 'Pursat',
      points: '85,170 140,160 165,185 170,212 100,218 85,195',
      fill: D,
      lx: 122,
      ly: 190,
      label: ['Pursat'],
    },
    {
      name: 'Tonle Sap',
      points: '140,118 162,124 185,150 178,168 155,150 145,135',
      fill: '#f3f1ec',
      lx: 0,
      ly: 0,
      label: [],
    },
    {
      name: 'Kampong Chhnang',
      points: '168,178 205,172 218,195 195,212 170,210',
      fill: M,
      lx: 190,
      ly: 190,
      label: ['Kampong', 'Chhnang'],
    },
    {
      name: 'Kampong Cham',
      points: '215,180 270,172 285,195 255,218 225,215',
      fill: L,
      lx: 247,
      ly: 196,
      label: ['Kampong', 'Cham'],
    },
    {
      name: 'Tbong Khmum',
      points: '268,190 318,205 315,222 285,225 270,212',
      fill: XL,
      lx: 294,
      ly: 214,
      label: ['Tbong Khmum'],
    },
    {
      name: 'Koh Kong',
      points: '88,215 150,212 158,250 130,265 100,270 88,240',
      fill: D,
      lx: 122,
      ly: 236,
      label: ['Koh Kong'],
    },
    {
      name: 'Kampong Speu',
      points: '148,212 200,210 208,240 182,255 152,250',
      fill: L,
      lx: 172,
      ly: 232,
      label: ['Kampong', 'Speu'],
    },
    {
      name: 'Kandal',
      points: '205,212 248,214 252,250 215,256 200,240',
      fill: XL,
      lx: 236,
      ly: 240,
      label: ['Kandal'],
    },
    {
      name: 'Phnom Penh',
      points: '200,222 226,220 230,240 210,244',
      fill: XXL,
      lx: 0,
      ly: 0,
      label: [],
    },
    {
      name: 'Prey Veng',
      points: '245,222 290,225 294,258 250,262 238,245',
      fill: XXL,
      lx: 268,
      ly: 243,
      label: ['Prey', 'Veng'],
    },
    {
      name: 'Svay Rieng',
      points: '252,255 296,258 296,272 258,272',
      fill: L,
      lx: 275,
      ly: 266,
      label: ['Svay Rieng'],
    },
    {
      name: 'Takeo',
      points: '178,252 215,258 240,262 232,288 195,290 180,272',
      fill: XL,
      lx: 206,
      ly: 272,
      label: ['Takeo'],
    },
    {
      name: 'Kampot',
      points: '148,255 185,255 195,288 165,296 148,278',
      fill: XXL,
      lx: 168,
      ly: 276,
      label: ['Kampot'],
    },
    {
      name: 'Kep',
      points: '160,288 178,290 175,302 160,300',
      fill: L,
      lx: 180,
      ly: 300,
      label: ['Kep'],
    },
    {
      name: 'Preah Sihanouk',
      points: '105,268 150,265 148,292 112,294',
      fill: XL,
      lx: 128,
      ly: 279,
      label: ['Preah', 'Sihanouk'],
    },
  ];
}
