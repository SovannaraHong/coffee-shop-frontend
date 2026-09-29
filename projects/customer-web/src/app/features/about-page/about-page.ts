import { Component } from '@angular/core';
interface AboutBlock {
  script: string;
  title: string;
  text: string;
  image: string;
  tag: string;
  points: string[];
}

@Component({
  imports: [],
  selector: 'app-about-page',
  styleUrl: './about-page.css',
  templateUrl: './about-page.html',
})
export class AboutPage {
  headerImage = '/assets/images/koi-kol/koi-banner.jpg';

  // Image goes LEFT on 1st, RIGHT on 2nd, LEFT on 3rd... automatically
  blocks: AboutBlock[] = [
    {
      script: 'How it began',
      title: 'A small cafe with a big heart',
      text: 'We opened our doors in 2018 with just four tables and a second-hand espresso machine. Our neighbors became regulars, and regulars became friends. Today we still greet everyone like they are family.',
      image: '/assets/images/koi-kol/koi-kol.jpg',
      tag: 'OUR FIRST SHOP',
      points: ['Family owned and run', 'Loved by our neighborhood', 'Open every single day'],
    },
    {
      script: 'What we serve',
      title: 'Fresh beans, roasted with care',
      text: 'We pick our beans from small farms and roast them in small batches so every cup tastes fresh and rich. Pair it with our homemade pastries and light meals, made fresh each morning.',
      image:
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
      tag: 'FRESHLY BREWED',
      points: [
        'Ethically sourced beans',
        'Baked in-house every morning',
        'Vegan and gluten-free options',
      ],
    },
    {
      script: 'Who we are',
      title: 'Baristas who love what they do',
      text: 'Our team is trained to brew the perfect cup, but what they enjoy most is making your day better. Come for the coffee, stay for the good vibes.',
      image:
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80',
      tag: 'LIFE HAPPENS ♥',
      points: [
        'Expert, friendly baristas',
        'Cozy spot for work or chat',
        'Free Wi-Fi for everyone',
      ],
    },
  ];

  stats = [
    { value: '8+', label: 'Years serving coffee' },
    { value: '25K', label: 'Happy customers' },
    { value: '40+', label: 'Drinks and treats' },
    { value: '100%', label: 'Freshly brewed daily' },
  ];
}
