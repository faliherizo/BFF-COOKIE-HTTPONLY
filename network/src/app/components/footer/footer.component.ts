import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nw-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [CommonModule],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
