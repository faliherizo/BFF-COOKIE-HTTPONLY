import { Component, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeService } from '../../services/theme/theme.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';

interface NavIcon {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

@Component({
  selector: 'nw-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
})
export class NavbarComponent implements OnDestroy {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly authSub: Subscription;

  navIcons: NavIcon[] = [
    { path: '/feed', icon: 'home', label: 'Accueil' },
    { path: '/network', icon: 'people', label: 'Réseau' },
    { path: '/messaging', icon: 'chat_bubble_outline', label: 'Messagerie', badge: 3 },
    { path: '/notifications', icon: 'notifications_none', label: 'Notifications', badge: 5 },
  ];

  constructor() {
    this.authSub = this.authService.authStateChanged.subscribe(() => {});
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateHome(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/feed']);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}
