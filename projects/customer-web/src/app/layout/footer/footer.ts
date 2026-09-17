import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './footer.html',
})
export class Footer {
  email = '';

  subscribe() {
    if (!this.email) return;
    // TODO: wire up to newsletter service
    console.log('Subscribing:', this.email);
    this.email = '';
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
