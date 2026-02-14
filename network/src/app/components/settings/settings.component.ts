import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
  };
  language: string;
  theme: string;
}

@Component({
  selector: 'nw-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class SettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  userSettings: UserSettings | null = null;
  loading = true;
  saving = false;
  saved = false;

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.http.get<{ settings: UserSettings }>(`${this.apiUrl}/api/settings`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.userSettings = res.settings;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  saveSettings(): void {
    if (!this.userSettings || this.saving) return;
    this.saving = true;
    this.saved = false;
    this.http.put(`${this.apiUrl}/api/settings`, this.userSettings, { withCredentials: true })
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          setTimeout(() => this.saved = false, 3000);
        },
        error: () => { this.saving = false; }
      });
  }
}
