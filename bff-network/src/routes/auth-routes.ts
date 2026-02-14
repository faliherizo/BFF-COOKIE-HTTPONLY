/**
 * auth-routes.ts
 * Defines the routes for Keycloak-based authentication.
 * Uses full-page redirect flow (no popup).
 *
 *  - /auth/keycloak-init   → saves session, redirects to /auth/keycloak
 *  - /auth/keycloak        → initiates Passport/Keycloak OAuth2 PKCE flow
 *  - /auth/keycloak/callback → handles callback, redirects to frontend /feed
 *  - /auth/logout           → initiates Keycloak SSO logout
 *  - /auth/logout/callback  → cleans session, redirects to frontend /
 *
 * @module routes/auth-routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logger } from '../logger';
import { COOKIE_ORIGIN } from '../config/env';

const {
  KEYCLOAK_AUTH_SERVER_URL,
  KEYCLOAK_REALM,
  BFF_LOGOUT_CALLBACK_URL,
} = process.env as {
  KEYCLOAK_AUTH_SERVER_URL: string;
  KEYCLOAK_REALM: string;
  BFF_LOGOUT_CALLBACK_URL: string;
};

/** The frontend origin for redirects after auth */
const FRONTEND_URL = COOKIE_ORIGIN || 'https://localhost:4200';

export const authRoutes: Router = Router();

/**
 * 1) /auth/keycloak-init
 * Saves session and redirects to /auth/keycloak (full page redirect).
 */
authRoutes.get('/auth/keycloak-init', (req: Request, res: Response) => {
  (req as any).session.save((err: any) => {
    if (err) {
      logger.error('Session save error:', err);
      return res.status(500).send('Session save error');
    }
    res.redirect('/auth/keycloak');
  });
});

/**
 * 2) /auth/keycloak
 * Passport.js Authentication with KeycloakStrategy
 */
authRoutes.get('/auth/keycloak', (req: Request, res: any, next: NextFunction) => {
  logger.debug('[/auth/keycloak] Request details:', {
    url: req.url,
    method: req.method,
    cookies: req.headers.cookie || 'missing',
    sessionID: req.sessionID,
  });

  passport.authenticate('keycloak', {
    scope: ['openid', 'profile', 'email']
  })(req, res, (err: any) => {
    if (err) {
      logger.error('[/auth/keycloak] Error during passport.authenticate:', { error: err });
      return next(err);
    }
    const locationHeader = res.getHeader('Location');
    logger.info(`[/auth/keycloak] Outbound 302 to Keycloak => ${locationHeader}`);
  });
});

/**
 * 3) /auth/keycloak/callback
 * Keycloak redirects here after successful or failed auth.
 * On success → redirects to frontend /feed
 * On failure → redirects to frontend /login
 */
authRoutes.get('/auth/keycloak/callback', (req: Request, res: Response, next: NextFunction) => {
  logger.debug('[/auth/keycloak/callback] Request details:', {
    url: req.url,
    method: req.method,
    query: req.query,
    cookies: req.headers.cookie || 'missing',
    sessionID: req.sessionID,
  });

  passport.authenticate('keycloak', (err: any, user: any, info: any) => {
    logger.debug('[/auth/keycloak/callback] Passport authentication result:', {
      error: err ? '*** exists ***' : 'none',
      user: user ? '*** exists ***' : 'missing',
      info: info ? '*** exists ***' : 'none',
    });

    if (err) {
      logger.error('[/auth/keycloak/callback] Authentication pipeline error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        sessionID: (req as any).sessionID,
      });
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }

    if (!user) {
      logger.warn('[/auth/keycloak/callback] Authentication failed:', { info });
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        logger.error('[/auth/keycloak/callback] Session login error:', {
          error: loginErr instanceof Error ? loginErr.message : 'Unknown error',
          userId: user.id,
        });
        return res.redirect(`${FRONTEND_URL}/login?error=session_error`);
      }

      logger.info('[/auth/keycloak/callback] User authenticated successfully:', {
        userId: user.id,
        sessionID: (req as any).sessionID,
      });

      // Full-page redirect to frontend feed
      res.redirect(`${FRONTEND_URL}/feed`);
    });
  })(req, res, next);
});


/**
 * 4) /auth/logout
 * Logs user out locally and triggers front-channel Keycloak logout
 */
authRoutes.get('/auth/logout', (req: Request, res: any, next: NextFunction) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return endLocalSession(req, res, 'NOT_LOGGED_IN');
    }

    const user: any = req.user || {};
    const idToken = user?.tokens?.idToken;
    if (!idToken) {
      logger.warn('No id_token in session; skipping Keycloak SSO logout');
      return endLocalSession(req, res, 'NO_ID_TOKEN');
    }

    const logoutUrl = `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`
      + `?id_token_hint=${idToken}`
      + `&post_logout_redirect_uri=${BFF_LOGOUT_CALLBACK_URL}`;

    res.redirect(logoutUrl);
  } catch (err: any) {
    logger.error('Logout route error:', { error: err });
    return next(err);
  }
});

/**
 * 5) /auth/logout/callback
 * Keycloak calls this route back after front-channel logout.
 * Redirects to frontend landing page.
 */
authRoutes.get('/auth/logout/callback', (req: Request, res: Response) => {
  endLocalSession(req, res, 'KEYCLOAK_LOGOUT_DONE');
});

/**
 * Helper: end local session and redirect to frontend
 */
function endLocalSession(req: Request, res: Response, reason: string) {
  const doRedirect = () => {
    res.clearCookie('network-session');
    logger.info(`Session ended: ${reason}`);
    res.redirect(`${FRONTEND_URL}/`);
  };

  if (req.isAuthenticated && req.isAuthenticated()) {
    req.logout((err: any) => {
      if (err) {
        logger.error('Error during logout:', { error: err });
      }
      (req as any).session.destroy((destroyErr: any) => {
        if (destroyErr) {
          logger.error('Error destroying session:', { error: destroyErr });
        }
        doRedirect();
      });
    });
  } else {
    doRedirect();
  }
}
