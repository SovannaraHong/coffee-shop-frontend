import { Directive, ElementRef, inject, output } from '@angular/core';

/** <div (appClickOutside)="close()"> — fires when the user clicks anywhere outside the element. */
@Directive({
  selector: '[appClickOutside]',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class ClickOutside {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly appClickOutside = output<void>();

  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }
}
