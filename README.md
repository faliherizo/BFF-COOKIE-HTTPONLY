# Network - Plateforme Professionnelle

Plateforme de réseautage professionnel inspirée de LinkedIn, implémentée avec Angular 19, Express.js (BFF pattern) et Keycloak pour l'authentification sécurisée.

## Aperçu

Network est une application de réseautage professionnel complète offrant :
- Un **fil d'actualité** interactif avec publications, likes et commentaires
- Un système de **messagerie** en temps réel entre utilisateurs
- La gestion de **connexions** et suggestions de contacts
- Des **notifications** pour rester informé des activités
- Un **profil professionnel** détaillé (expérience, formation, compétences)
- Des **paramètres** personnalisables (notifications, confidentialité, langue)
- Une **page d'accueil statique** pour les visiteurs non connectés
- Une **authentification sécurisée** via Keycloak (redirection, pas de popup)

## Fonctionnalités

### Frontend (Angular 19)
| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Landing page avec présentation de la plateforme |
| Connexion | `/login` | Page de connexion via Keycloak |
| Fil d'actualité | `/feed` | Publications, création de posts, sidebar actualités |
| Réseau | `/network` | Connexions, suggestions, invitations |
| Messagerie | `/messaging` | Conversations en temps réel |
| Notifications | `/notifications` | Activités et alertes |
| Profil | `/profile` | Profil LinkedIn-style avec expérience et compétences |
| Paramètres | `/settings` | Notifications, confidentialité, langue et thème |

### Backend (Express.js BFF)
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/feed` | GET/POST | Récupérer/créer des publications |
| `/api/feed/:id/like` | POST | Aimer une publication |
| `/api/messages` | GET | Liste des conversations |
| `/api/messages/:id` | GET/POST | Messages d'une conversation |
| `/api/connections` | GET | Liste des connexions |
| `/api/connections/suggestions` | GET | Suggestions de contacts |
| `/api/notifications` | GET | Notifications |
| `/api/settings` | GET/PUT | Paramètres utilisateur |
| `/api/profile/extended` | GET | Profil complet |
| `/auth/keycloak-init` | GET | Initier la connexion Keycloak |
| `/auth/logout` | GET | Déconnexion |

## Architecture

| Composant | Technologie | Port | Rôle |
|-----------|------------|------|------|
| Frontend (network) | Angular 19 + Material | 4200 | Application SPA |
| Backend (bff-network) | Express.js | 3000 | Backend-For-Frontend (BFF) |
| Keycloak | v26 | 8443 | Fournisseur d'identité |
| Redis | v7 | 6379 | Stockage de sessions |

## Design

Le design s'inspire de LinkedIn avec :
- Palette de couleurs : bleu `#0a66c2`, fond gris `#f3f2ef`, cartes blanches
- Navigation sticky avec icônes, badges et menu profil
- Layout responsive avec grille adaptative (sidebar + contenu + widget)
- Cartes avec ombres douces et coins arrondis

## Démarrage rapide

```bash
# Configurer les certificats SSL
./scripts/setup_ssl.sh

# Démarrer tous les services
docker compose up -d
```

Accès aux applications :
- Frontend : https://frontend.local.com:4200
- Backend : https://backend.local.com:3000
- Keycloak : https://keycloak.local.com:8443

## Prérequis

- Docker 20.10+
- Node.js 18.x
- OpenSSL
- Configuration des domaines locaux (voir [Configuration des domaines](docs/DOMAINS.md))

## Documentation

- [Configuration des domaines et SSL](docs/DOMAINS.md)
- [Gestion des sessions](docs/SESSIONS.md)
- [Configuration Docker](docs/DOCKER.md)
- [Guide de développement](docs/DEVELOPMENT.md)
- [Dépannage](docs/TROUBLESHOOTING.md)

## Licence

[MIT](./LICENSE)
