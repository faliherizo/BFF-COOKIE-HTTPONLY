import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface ExtendedProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  avatar: string;
  coverImage: string;
  about: string;
  connections: number;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number;
  }[];
  skills: string[];
}

@Component({
  selector: 'nw-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
})
export class ProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  profile: ExtendedProfile | null = null;
  loading = true;

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.http.get<{ profile: ExtendedProfile }>(`${this.apiUrl}/api/profile/extended`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.profile = res.profile;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
