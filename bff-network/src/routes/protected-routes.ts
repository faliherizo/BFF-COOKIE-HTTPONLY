/**
 * protected-routes.ts
 * Defines routes that require an authenticated user.
 * Proxies business API calls to the Java backend service.
 * Merges session user data where needed (profile endpoints).
 * 
 * @module routes/protected-routes
 */

import { Router, Request, Response } from 'express';
import { BACKEND_API_URL } from '../config/env';
import { logger } from '../logger';

/**
 * Proxy a GET request to the Java backend and return the result.
 */
async function proxyGet(path: string): Promise<any> {
  const url = `${BACKEND_API_URL}${path}`;
  logger.debug(`Proxying GET to backend: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Proxy a POST/PUT request to the Java backend and return the result.
 */
async function proxyMutate(method: string, path: string, body?: any): Promise<any> {
  const url = `${BACKEND_API_URL}${path}`;
  logger.debug(`Proxying ${method} to backend: ${url}`);
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export function protectedRoutes(isAuthenticated: any): Router {
  const router = Router();

  // ─── Profile (merges BFF session user with backend data) ───
  router.get('/api/profile', isAuthenticated, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  router.get('/api/user-details', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/user-details');
      res.json({ user: req.user, ...data });
    } catch (err: any) {
      logger.error('Failed to proxy /api/user-details:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.get('/api/profile/extended', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/profile/extended');
      res.json({ user: req.user, ...data });
    } catch (err: any) {
      logger.error('Failed to proxy /api/profile/extended:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Legacy routes ─────────────────────────────────────
  router.get('/api/transactions', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/transactions');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/transactions:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.get('/api/products', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/products');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/products:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Feed ──────────────────────────────────────────────
  router.get('/api/feed', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const count = req.query['count'] || '10';
      const data = await proxyGet(`/api/feed?count=${count}`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/feed:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.post('/api/feed', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('POST', '/api/feed', req.body);
      res.status(201).json(data);
    } catch (err: any) {
      logger.error('Failed to proxy POST /api/feed:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.post('/api/feed/:postId/like', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('POST', `/api/feed/${req.params['postId']}/like`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy POST /api/feed/:postId/like:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Messages ──────────────────────────────────────────
  router.get('/api/messages', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/messages');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/messages:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.get('/api/messages/:conversationId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyGet(`/api/messages/${req.params['conversationId']}`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/messages/:conversationId:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.post('/api/messages/:conversationId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('POST', `/api/messages/${req.params['conversationId']}`, req.body);
      res.status(201).json(data);
    } catch (err: any) {
      logger.error('Failed to proxy POST /api/messages/:conversationId:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Connections (Network) ─────────────────────────────
  router.get('/api/connections', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/connections');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/connections:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.get('/api/connections/suggestions', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/connections/suggestions');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/connections/suggestions:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.post('/api/connections/:userId/connect', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('POST', `/api/connections/${req.params['userId']}/connect`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy POST /api/connections/:userId/connect:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.post('/api/connections/:userId/accept', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('POST', `/api/connections/${req.params['userId']}/accept`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy POST /api/connections/:userId/accept:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Notifications ─────────────────────────────────────
  router.get('/api/notifications', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/notifications');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/notifications:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.put('/api/notifications/:id/read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('PUT', `/api/notifications/${req.params['id']}/read`);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy PUT /api/notifications/:id/read:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  // ─── Settings ──────────────────────────────────────────
  router.get('/api/settings', isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const data = await proxyGet('/api/settings');
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy /api/settings:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  router.put('/api/settings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = await proxyMutate('PUT', '/api/settings', req.body);
      res.json(data);
    } catch (err: any) {
      logger.error('Failed to proxy PUT /api/settings:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  });

  return router;
}
