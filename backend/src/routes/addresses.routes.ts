import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const addressesRouter = Router();

addressesRouter.use(requireAuth('customer'));

const addressInputSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  note: z.string().optional(),
});

addressesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({
      where: { customerId: req.auth!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json(addresses);
  }),
);

addressesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = addressInputSchema.parse(req.body);
    const address = await prisma.address.create({
      data: { ...data, customerId: req.auth!.sub },
    });
    res.status(201).json(address);
  }),
);

addressesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = addressInputSchema.partial().parse(req.body);

    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.customerId !== req.auth!.sub) {
      throw new AppError(404, 'Adresa nije pronadjena');
    }

    const address = await prisma.address.update({ where: { id: req.params.id }, data });
    res.json(address);
  }),
);

addressesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.customerId !== req.auth!.sub) {
      throw new AppError(404, 'Adresa nije pronadjena');
    }

    await prisma.address.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);
