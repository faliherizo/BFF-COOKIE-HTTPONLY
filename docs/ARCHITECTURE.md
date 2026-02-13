# Architecture du Projet Angular-BFF-Keycloak

## 1. Vue d'ensemble

Ce projet implémente le pattern **Backend-For-Frontend (BFF)** pour sécuriser une application Angular avec Keycloak comme fournisseur d'identité. L'architecture garantit une **isolation complète des tokens côté client** : aucun token OAuth2 (access, refresh, id) n'est jamais exposé au navigateur.

```
┌─────────────┐     HTTPS      ┌─────────────┐     HTTPS      ┌─────────────┐
│   Angular    │ ◄────────────► │  Express.js  │ ◄────────────► │  Keycloak   │
│  (Frontend)  │   Cookies      │    (BFF)     │   OAuth2/OIDC  │    (IdP)    │
│  Port 4200   │   HttpOnly     │  Port 3000   │                │  Port 8443  │
└─────────────┘                 └──────┬───────┘                └──────┬──────┘
                                       │                               │
                                       │ Sessions                      │ Données
                                       ▼                               ▼
                                ┌─────────────┐                ┌─────────────┐
                                │    Redis     │                │  PostgreSQL  │
                                │  Port 6379   │                │  Port 5432   │
                                └─────────────┘                └─────────────┘
```

## 2. Composants principaux

| Composant | Technologie | Port | Rôle |
|-----------|------------|------|------|
| **Frontend** | Angular 19 + Material | 4200 | SPA - Interface utilisateur |
| **Backend (BFF)** | Express.js + Passport.js | 3000 | Proxy d'authentification, API gateway |
| **Keycloak** | Keycloak v26.1 | 8443 | Fournisseur d'identité (IdP) OAuth2/OIDC |
| **Redis** | Redis 7.0 | 6379 | Stockage des sessions (optionnel, sinon in-memory) |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Base de données Keycloak |
| **Redis Commander** | Redis Commander | 8081 | Interface d'administration Redis |

## 3. Architecture Frontend (Angular 19)

### 3.1 Structure des modules

```
frontend/src/app/
├── app.component.ts          # Composant racine (Navbar + RouterOutlet + Footer)
├── app.config.ts             # Configuration (APP_SETTINGS injection token)
├── app.routes.ts             # Définition des routes avec métadonnées de navigation
├── components/
│   ├── navbar/               # Barre de navigation dynamique (auth-aware)
│   ├── home/                 # Page d'accueil (publique)
│   ├── profile/              # Profil utilisateur (protégé)
│   ├── product-list/         # Liste de produits (protégé)
│   ├── transactions/         # Transactions (protégé)
│   ├── access-denied/        # Page d'accès refusé
│   └── footer/               # Pied de page
├── guards/
│   └── auth/auth.guard.ts    # Guard canActivate vérifiant l'authentification
├── interceptors/
│   └── with-credentials.interceptor.ts  # Ajoute withCredentials à toutes les requêtes HTTP
├── models/                   # Interfaces TypeScript (KeycloakUser, Product, Transaction, UserProfile)
├── services/
│   ├── auth/auth.service.ts           # Service d'authentification (login/logout via popup)
│   ├── error-handler/                 # GlobalErrorHandler personnalisé
│   └── theme/theme.service.ts         # Service de gestion du thème (dark/light)
└── types/                    # Types personnalisés pour le routing (NavRoute, ErrorRoute)
```

### 3.2 Mécanisme d'authentification côté Frontend

Le `AuthService` utilise un **mécanisme de popup** pour l'authentification :

1. **Login** : Ouvre une popup vers `{BFF}/auth/keycloak-init`
2. **Communication** : Écoute les `postMessage` (`LOGIN_SUCCESS`) depuis la popup
3. **Logout** : Ouvre une popup vers `{BFF}/auth/logout`, écoute `LOGOUT_SUCCESS`
4. **Vérification d'état** : Appelle `GET /api/profile` pour vérifier la session active

### 3.3 Proxy de développement

Le fichier `proxy.conf.json` redirige `/api/*` et `/auth/*` vers le backend (`https://localhost:3000`), permettant au frontend de communiquer avec le BFF en développement.

### 3.4 Intercepteur HTTP

`WithCredentialsInterceptor` ajoute automatiquement `withCredentials: true` à toutes les requêtes HTTP sortantes, garantissant l'envoi des cookies de session.

### 3.5 Route Guard

`authGuard` vérifie `AuthService.isAuthenticated()`. Si non authentifié :
- Affiche un snackbar proposant de se connecter
- Redirige vers `/home`

## 4. Architecture Backend (Express.js BFF)

### 4.1 Structure des modules

```
backend/src/
├── index.ts                    # Point d'entrée : HTTPS server + vérifications runtime
├── app.ts                      # Configuration Express (CORS, sessions, Passport, routes)
├── logger.ts                   # Winston logger
├── auth/
│   └── keycloak-strategy.ts    # Stratégie Passport.js Keycloak OAuth2 OIDC (PKCE)
├── config/
│   └── env.ts                  # Chargement et export des variables d'environnement
├── middleware/
│   ├── is-authenticated.ts     # Middleware de vérification d'authentification
│   └── keycloak-proxy.ts       # Middleware de logging des requêtes Keycloak
├── routes/
│   ├── auth-routes.ts          # Routes d'authentification OAuth2 (5 endpoints)
│   ├── protected-routes.ts     # Routes API protégées (profile, transactions, products)
│   ├── public-routes.ts        # Routes publiques (home, debug, test)
│   ├── session-public.ts       # API publique de gestion des sessions
│   └── session-private.ts      # API interne de gestion des sessions
├── services/
│   └── mock-data.service.ts    # Service de données fictives (Faker.js)
├── session/
│   └── redis-session.ts        # Store Redis pour express-session
├── types/                      # Déclarations TypeScript (session, passport, request)
└── utils/
    ├── paths.ts                # Utilitaires de chemins de fichiers
    └── pkce.ts                 # Utilitaires PKCE
```

### 4.2 Pipeline de middleware (ordre d'exécution)

1. **Trust Proxy** — `app.set('trust proxy', true)`
2. **Morgan Logger** — Logging HTTP combiné via Winston
3. **CORS** — Origine autorisée : `COOKIE_ORIGIN`, credentials activés
4. **Session** — Cookie `angular-session`, sécurisé, HttpOnly, SameSite=None, TTL 15min
5. **Debug Middleware** — Logging des détails de requête
6. **Passport Initialize** — Initialisation de Passport.js
7. **Passport Session** — Désérialisation de session Passport
8. **Serialize/Deserialize** — Sérialisation de l'objet utilisateur complet
9. **Keycloak Strategy** — Initialisation de la stratégie OAuth2 OIDC
10. **Security Headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy
11. **Keycloak Proxy Middleware** — Logging spécifique des requêtes Keycloak
12. **Routes** — Auth, Protected, Public, Session

### 4.3 Routes d'authentification

| Route | Méthode | Description |
|-------|---------|-------------|
| `` | GET | Initialise le flux OAuth2, sauvegarde la session, redirige vers `/auth/keycloak` |
| `/auth/keycloak` | GET | Déclenche `passport.authenticate('keycloak')` avec PKCE |
| `/auth/keycloak/callback` | GET | Callback OAuth2 — reçoit le code, échange les tokens, crée la session |
| `/auth/logout` | GET | Déconnexion locale + redirection SSO Keycloak avec `id_token_hint` |
| `/auth/logout/callback` | GET | Callback post-logout Keycloak — destruction de session |

### 4.4 Routes API protégées

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/profile` | GET | Retourne les données du profil utilisateur |
| `/api/user-details` | GET | Retourne profil + détails supplémentaires (MockDataService) |
| `/api/transactions` | GET | Retourne une liste de transactions fictives |
| `/api/products` | GET | Retourne une liste de produits fictifs |

### 4.5 Routes de gestion des sessions

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/sessions` | GET | Liste les sessions actives (Redis) |
| `/api/sessions/:id` | DELETE | Invalide une session |
| `/api/sessions/:id/refresh` | POST | Rafraîchit le TTL d'une session |
| `/internal/sessions` | GET | Liste interne des sessions |
| `/internal/sessions/:id` | DELETE | Invalidation interne |

### 4.6 Stratégie Keycloak (Passport.js)

- **Protocole** : OAuth2 + OpenID Connect
- **PKCE** : Activé (Proof Key for Code Exchange)
- **Scopes** : `openid profile email`
- **Client type** : Public client
- **SSL** : Required for all
- **Token handling** : Les tokens (access, refresh, id) sont stockés dans la session serveur, jamais envoyés au client

### 4.7 Gestion des sessions

- **Store par défaut** : In-memory
- **Store optionnel** : Redis (activé via `SESSION_STORE=redis`)
- **Cookie** : `angular-session`, secure, HttpOnly, SameSite=None
- **TTL** : 15 minutes (rolling)
- **Debug** : `DebugRedisStore` wrapper avec logging des opérations GET/SET

## 5. Infrastructure Docker

### 5.1 Services

```yaml
services:
  frontend      → Angular app (Dockerfile dans frontend/)
  backend       → Express.js BFF (Dockerfile dans backend/)
  keycloak      → Keycloak v26.1 (image officielle)
  postgres      → PostgreSQL 15 (persistence Keycloak)
  redis         → Redis 7.0-alpine (sessions)
  redis-commander → Interface web Redis
```

### 5.2 Réseau

Tous les services communiquent via le réseau Docker `devnetwork` (bridge).

### 5.3 Volumes

| Volume | Usage |
|--------|-------|
| `postgres_data` | Données PostgreSQL (Keycloak) |
| `redis_data` | Données Redis (sessions) |
| `frontend_node_modules` | node_modules du frontend |
| `backend_node_modules` | node_modules du backend |
| `test_data` | Données Keycloak |
| `import_dir` | Import du realm Keycloak |

### 5.4 SSL/TLS

- Tous les services communiquent en HTTPS
- Certificats personnalisés générés par `scripts/setup_ssl.sh`
- `NODE_TLS_REJECT_UNAUTHORIZED=0` en développement (certificats auto-signés)

## 6. Flux de sécurité

### 6.1 Principe BFF

```
Browser  ←→  BFF (Express)  ←→  Keycloak
  │              │
  │  Cookie      │  Access Token
  │  HttpOnly    │  Refresh Token
  │  Secure      │  ID Token
  │              │  (stockés en session)
  └── Aucun token exposé au client ──┘
```

### 6.2 Protection des routes

- **Frontend** : `authGuard` (canActivate) vérifie `AuthService.isAuthenticated()`
- **Backend** : `isAuthenticated` middleware vérifie `req.isAuthenticated()` (Passport.js)
- **Double protection** : Les routes sont protégées côté client ET côté serveur

### 6.3 Protection CORS

- Origine unique autorisée (`COOKIE_ORIGIN`)
- Credentials activés
- Headers limités (`Content-Type`, `Authorization`)

## 7. Diagrammes de séquence

Les diagrammes de séquence PlantUML sont disponibles dans le dossier `docs/diagrams/` :

- [Flux d'authentification (Login)](diagrams/sequence-login.puml)
- [Flux de déconnexion (Logout)](diagrams/sequence-logout.puml)
- [Requête API protégée](diagrams/sequence-api-request.puml)
- [Vérification de session au démarrage](diagrams/sequence-session-check.puml)
- [Architecture globale des composants](diagrams/component-architecture.puml)
