import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { AppSettings, APP_SETTINGS } from 'app/app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toastr: ToastrService = inject(ToastrService);

  private isLoggedIn = false;
  public authStateChanged = new Subject<void>();

  private settings: AppSettings = inject(APP_SETTINGS);
  private apiUrl = this.settings.api.baseUrl;

  constructor() {
    this.refreshSessionStatus();
  }

  markLoggedIn(): void {
    this.isLoggedIn = true;
    this.authStateChanged.next();
    this.toastr.success('You are now logged in!', 'Success');
  }

  markLoggedOut(): void {
    this.isLoggedIn = false;
    this.authStateChanged.next();
  }

  refreshSessionStatus(): void {
    this.http.get(`${this.apiUrl}/api/profile`, { withCredentials: true })
      .subscribe({
        next: (_res) => {
          this.isLoggedIn = true;
          this.authStateChanged.next();
        },
        error: (_err) => {
          this.isLoggedIn = false;
          this.authStateChanged.next();
        }
      });
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  /**
   * Full-page redirect to Keycloak login via BFF
   */
  login(): void {
    window.location.href = `${this.apiUrl}/auth/keycloak-init`;
  }

  /**
   * Full-page redirect to logout via BFF
   */
  logout(): void {
    window.location.href = `${this.apiUrl}/auth/logout`;
  }
}
