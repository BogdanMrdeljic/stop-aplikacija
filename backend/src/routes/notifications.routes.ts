import { Router } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth('customer'));

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { customerId: req.auth!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  }),
);

notificationsRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.customerId !== req.auth!.sub) {
      throw new AppError(404, 'Notifikacija nije pronadjena');
    }

    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  }),
);
