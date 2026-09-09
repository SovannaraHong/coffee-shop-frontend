import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterModule } from '@angular/router';

@Component({
  imports: [Navbar, RouterModule],
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
})
export class MainLayout {}
