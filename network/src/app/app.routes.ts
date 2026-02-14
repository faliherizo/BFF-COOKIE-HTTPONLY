import { Routes } from '@angular/router';
import { authGuard } from '@guards';
import {
  LandingComponent,
  LoginComponent,
  FeedComponent,
  ProfileComponent,
  NetworkComponent,
  MessagingComponent,
  NotificationsComponent,
  SettingsComponent,
  AccessDeniedComponent,
} from '@components';

export const APP_ROUTES: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'feed',
    component: FeedComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'network',
    component: NetworkComponent,
    canActivate: [authGuard],
  },
  {
    path: 'messaging',
    component: MessagingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  { path: '**', redirectTo: '' },
];
