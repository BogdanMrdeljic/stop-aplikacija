import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} ne postoji` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Neispravan zahtev', details: err.flatten() });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Zapis nije pronadjen' });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'Ne moze se obrisati/izmeniti - postoje povezani zapisi' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Zapis sa ovom vrednoscu vec postoji' });
    }
  }

  console.error(err);
  return res.status(500).json({ error: 'Doslo je do greske na serveru' });
}
