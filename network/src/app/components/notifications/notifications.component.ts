import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'message' | 'job' | 'mention';
  actor: { name: string; avatar: string };
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

@Component({
  selector: 'nw-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class NotificationsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  notifications: Notification[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.http.get<{ notifications: Notification[] }>(`${this.apiUrl}/api/notifications`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.notifications = res.notifications;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  markAsRead(notif: Notification): void {
    if (notif.read) return;
    this.http.put(`${this.apiUrl}/api/notifications/${notif.id}/read`, {}, { withCredentials: true })
      .subscribe(() => {
        notif.read = true;
      });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      like: 'thumb_up',
      comment: 'chat_bubble',
      connection: 'person_add',
      message: 'email',
      job: 'work',
      mention: 'alternate_email',
    };
    return icons[type] || 'notifications';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      like: '#0a66c2',
      comment: '#057642',
      connection: '#0a66c2',
      message: '#e7a33e',
      job: '#5f9b41',
      mention: '#cc1016',
    };
    return colors[type] || '#666666';
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
