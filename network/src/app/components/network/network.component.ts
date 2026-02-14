import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface Connection {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  mutualConnections: number;
  connected: boolean;
  pendingRequest: boolean;
}

@Component({
  selector: 'nw-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
})
export class NetworkComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  connections: Connection[] = [];
  suggestions: Connection[] = [];
  loading = true;
  loadingSuggestions = true;

  ngOnInit(): void {
    this.loadConnections();
    this.loadSuggestions();
  }

  loadConnections(): void {
    this.http.get<{ connections: Connection[] }>(`${this.apiUrl}/api/connections`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.connections = res.connections;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  loadSuggestions(): void {
    this.http.get<{ suggestions: Connection[] }>(`${this.apiUrl}/api/connections/suggestions`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.suggestions = res.suggestions;
          this.loadingSuggestions = false;
        },
        error: () => { this.loadingSuggestions = false; }
      });
  }

  connect(person: Connection): void {
    this.http.post(`${this.apiUrl}/api/connections/${person.id}/connect`, {}, { withCredentials: true })
      .subscribe(() => {
        person.pendingRequest = true;
      });
  }

  acceptRequest(person: Connection): void {
    this.http.post(`${this.apiUrl}/api/connections/${person.id}/accept`, {}, { withCredentials: true })
      .subscribe(() => {
        person.connected = true;
        person.pendingRequest = false;
      });
  }

  get pendingRequests(): Connection[] {
    return this.connections.filter(c => c.pendingRequest && !c.connected);
  }

  get myConnections(): Connection[] {
    return this.connections.filter(c => c.connected);
  }
}
