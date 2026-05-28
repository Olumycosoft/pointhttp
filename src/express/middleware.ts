import { PointHttpOptions } from '../types';
import * as PointHttpEngine from '../core/engine';

const normalizeEnv = (env: string): string => {
  const e = (env || '').trim().toLowerCase();
  const map: Record<string, string> = {
    dev: 'development',
    development: 'development',
    test: 'test',
    testing: 'test',
    staging: 'staging',
    stg: 'staging',
    prod: 'production',
    production: 'production',
  };
  return map[e] || 'development';
};

const sendResponse = (res: any, status: number, body: string) => {
  if (typeof res.status === 'function') {
    res.status(status).send(body);
  } else {
    res.statusCode = status;
    res.end(body);
  }
};

export function playground(options: PointHttpOptions = {} as PointHttpOptions) {
  const enabledEnvs = (options.enabledEnvironments || ['development', 'test']).map(normalizeEnv);
  const currentEnv = normalizeEnv(process.env.NODE_ENV || 'development');

  const isExplicitlyDisabled = options.enabled === false;
  const isAllowedEnv = options.enabled === true || enabledEnvs.includes(currentEnv);

  return async (req: any, res: any, next?: any) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      if (typeof next === 'function') next();
      return;
    }

    // Fall through silently when disabled so the request is handled
    // by other routes rather than exposing whether this route exists
    if (isExplicitlyDisabled || !isAllowedEnv) {
      if (typeof next === 'function') next();
      return;
    }

    // Custom authorization gate
    if (options.customAuth) {
      try {
        const isAuthorized = await options.customAuth(req, res);
        if (!isAuthorized) {
          sendResponse(res, 403, 'Forbidden: Unauthorized Access');
          return;
        }
      } catch {
        sendResponse(res, 403, 'Forbidden: Unauthorized Access');
        return;
      }
    }

    try {
      const html = PointHttpEngine.render(options);

      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }

      sendResponse(res, 200, html);
    } catch (error: any) {
      if (typeof next === 'function') {
        next(error);
      } else {
        sendResponse(res, 500, `[PointHTTP] Failed to render playground: ${error.message}`);
      }
    }
  };
}