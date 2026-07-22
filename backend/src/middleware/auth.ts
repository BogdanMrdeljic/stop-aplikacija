import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { JwtRole, verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      auth?: { sub: string; role: JwtRole };
    }
  }
}

export function requireAuth(...allowedRoles: JwtRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError(401, 'Nedostaje autorizacioni token'));
    }

    try {
      const payload = verifyToken(header.slice('Bearer '.length));
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return next(new AppError(403, 'Nemas dozvolu za ovu akciju'));
      }
      req.auth = payload;
      next();
    } catch {
      next(new AppError(401, 'Nevazeci ili istekao token'));
    }
  };
}
