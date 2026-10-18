import { Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-ring',
  templateUrl: './customer-ring.html',
})
export class CustomerRing {
  readonly firstTime = input('5.5K');
  readonly firstTimePct = input(25);
  readonly returning = input('3.5K');
  readonly returningPct = input(21);
}
