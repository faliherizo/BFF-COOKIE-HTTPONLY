import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface FeedPost {
  id: string;
  author: { id: string; name: string; headline: string; avatar: string };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked: boolean;
}

@Component({
  selector: 'nw-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class FeedComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  posts: FeedPost[] = [];
  loading = true;
  newPostContent = '';
  posting = false;

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.http.get<{ posts: FeedPost[] }>(`${this.apiUrl}/api/feed`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.posts = res.posts;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  createPost(): void {
    if (!this.newPostContent.trim() || this.posting) return;
    this.posting = true;
    this.http.post<{ post: FeedPost }>(`${this.apiUrl}/api/feed`, { content: this.newPostContent }, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.posts.unshift(res.post);
          this.newPostContent = '';
          this.posting = false;
        },
        error: () => {
          this.posting = false;
        }
      });
  }

  toggleLike(post: FeedPost): void {
    this.http.post(`${this.apiUrl}/api/feed/${post.id}/like`, {}, { withCredentials: true })
      .subscribe(() => {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      });
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
