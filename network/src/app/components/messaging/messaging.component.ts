import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AppSettings, APP_SETTINGS } from 'app/app.config';

interface Conversation {
  id: string;
  participant: { id: string; name: string; avatar: string; headline: string; online: boolean };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  sender: { id: string; name: string; avatar: string; headline: string; online: boolean };
  content: string;
  timestamp: string;
  read: boolean;
}

@Component({
  selector: 'nw-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
})
export class MessagingComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly settings: AppSettings = inject(APP_SETTINGS);
  private readonly apiUrl = this.settings.api.baseUrl;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  loading = true;
  loadingMessages = false;
  newMessage = '';

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.http.get<{ conversations: Conversation[] }>(`${this.apiUrl}/api/messages`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.conversations = res.conversations;
          this.loading = false;
          if (this.conversations.length > 0) {
            this.selectConversation(this.conversations[0]);
          }
        },
        error: () => { this.loading = false; }
      });
  }

  selectConversation(conv: Conversation): void {
    this.selectedConversation = conv;
    this.loadingMessages = true;
    this.http.get<{ messages: Message[] }>(`${this.apiUrl}/api/messages/${conv.id}`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.messages = res.messages;
          this.loadingMessages = false;
        },
        error: () => { this.loadingMessages = false; }
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    this.http.post<{ message: Message }>(
      `${this.apiUrl}/api/messages/${this.selectedConversation.id}`,
      { content: this.newMessage },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.messages.push(res.message);
        this.newMessage = '';
      }
    });
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'maintenant';
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }
}
