import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'nw-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [CommonModule, MatIconModule],
})
export class LandingComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  login(): void {
    this.authService.login();
  }

  features = [
    {
      icon: 'group',
      title: 'Connectez-vous avec des professionnels',
      description: 'Développez votre réseau professionnel et restez en contact avec vos collègues.'
    },
    {
      icon: 'work',
      title: 'Trouvez votre prochain emploi',
      description: 'Découvrez des opportunités de carrière adaptées à votre profil et vos compétences.'
    },
    {
      icon: 'school',
      title: 'Apprenez de nouvelles compétences',
      description: 'Accédez à des contenus éducatifs pour développer vos compétences professionnelles.'
    },
  ];
}
