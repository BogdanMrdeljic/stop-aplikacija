import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const products = await prisma.product.findMany({
      where: { categoryId, isAvailable: true },
      include: { modifiers: true },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  }),
);

productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { modifiers: true },
    });
    if (!product) throw new AppError(404, 'Proizvod nije pronadjen');
    res.json(product);
  }),
);

const productInputSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
});

productsRouter.post(
  '/',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = productInputSchema.parse(req.body);

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError(404, 'Kategorija nije pronadjena');

    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  }),
);

productsRouter.put(
  '/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = productInputSchema.partial().parse(req.body);

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new AppError(404, 'Kategorija nije pronadjena');
    }

    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(product);
  }),
);

productsRouter.delete(
  '/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

const modifierInputSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
});

productsRouter.post(
  '/:productId/modifiers',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = modifierInputSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) throw new AppError(404, 'Proizvod nije pronadjen');

    const modifier = await prisma.productModifier.create({
      data: { ...data, productId: req.params.productId },
    });
    res.status(201).json(modifier);
  }),
);

productsRouter.put(
  '/modifiers/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const data = modifierInputSchema.partial().parse(req.body);
    const modifier = await prisma.productModifier.update({ where: { id: req.params.id }, data });
    res.json(modifier);
  }),
);

productsRouter.delete(
  '/modifiers/:id',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    await prisma.productModifier.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);
