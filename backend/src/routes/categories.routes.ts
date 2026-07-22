import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const categoriesRouter = Router();

const categoryInputSchema = z.object({
  name: z.string().min(1),
});

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  }),
);

categoriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) throw new AppError(404, 'Kategorija nije pronadjena');
    res.json(category);
  }),
);

categoriesRouter.post(
  '/',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = categoryInputSchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  }),
);

categoriesRouter.put(
  '/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = categoryInputSchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(category);
  }),
);

categoriesRouter.delete(
  '/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);
