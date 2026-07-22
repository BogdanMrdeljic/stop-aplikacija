import { Router } from 'express';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { emitNewOrder, emitNotification, emitOrderStatusChanged } from '../sockets';
import { requireAuth } from '../middleware/auth';
import { orderStatusMessages } from '../utils/orderStatusMessages';

export const ordersRouter = Router();

ordersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? (req.query.status as OrderStatus) : undefined;
    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        items: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  }),
);

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { modifiers: true, product: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        address: true,
        history: true,
      },
    });
    if (!order) throw new AppError(404, 'Porudzbina nije pronadjena');
    res.json(order);
  }),
);

const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  modifierIds: z.array(z.string().uuid()).default([]),
});

const createOrderSchema = z
  .object({
    orderType: z.nativeEnum(OrderType),
    addressId: z.string().uuid().optional(),
    items: z.array(orderItemInputSchema).min(1),
  })
  .refine((data) => data.orderType !== 'delivery' || !!data.addressId, {
    message: 'addressId je obavezan za dostavu',
    path: ['addressId'],
  });

ordersRouter.post(
  '/',
  requireAuth('customer'),
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    const customerId = req.auth!.sub;

    if (input.addressId) {
      const address = await prisma.address.findUnique({ where: { id: input.addressId } });
      if (!address || address.customerId !== customerId) {
        throw new AppError(404, 'Adresa nije pronadjena');
      }
    }

    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const modifierIds = [...new Set(input.items.flatMap((item) => item.modifierIds))];
    const modifiers = modifierIds.length
      ? await prisma.productModifier.findMany({ where: { id: { in: modifierIds } } })
      : [];
    const modifierMap = new Map(modifiers.map((modifier) => [modifier.id, modifier]));

    let total = new Prisma.Decimal(0);
    const resolvedItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product || !product.isAvailable) {
        throw new AppError(400, `Proizvod ${item.productId} nije dostupan`);
      }

      const chosenModifiers = item.modifierIds.map((modifierId) => {
        const modifier = modifierMap.get(modifierId);
        if (!modifier || modifier.productId !== item.productId) {
          throw new AppError(400, `Modifikator ${modifierId} ne pripada proizvodu ${item.productId}`);
        }
        return modifier;
      });

      const modifiersTotal = chosenModifiers.reduce((sum, m) => sum.plus(m.price), new Prisma.Decimal(0));
      const lineTotal = product.price.plus(modifiersTotal).times(item.quantity);
      total = total.plus(lineTotal);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        modifiers: chosenModifiers.map((m) => ({ name: m.name, price: m.price })),
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId,
          addressId: input.addressId,
          orderType: input.orderType,
          status: OrderStatus.pending,
          total,
        },
      });

      for (const item of resolvedItems) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice,
            modifiers: { create: item.modifiers },
          },
        });
      }

      await tx.orderHistory.create({
        data: { orderId: created.id, status: OrderStatus.pending },
      });

      const notification = await tx.notification.create({
        data: { customerId, orderId: created.id, message: orderStatusMessages[OrderStatus.pending] },
      });

      return {
        order: await tx.order.findUniqueOrThrow({
          where: { id: created.id },
          include: { items: { include: { modifiers: true } }, address: true },
        }),
        notification,
      };
    });

    emitNewOrder(order.order);
    emitNotification(customerId, order.notification);
    res.status(201).json(order.order);
  }),
);

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  employeeId: z.string().uuid().optional(),
});

ordersRouter.patch(
  '/:id/status',
  requireAuth('employee'),
  asyncHandler(async (req, res) => {
    const { status, employeeId } = statusUpdateSchema.parse(req.body);

    const { order, notification } = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: { status },
      });

      await tx.orderHistory.create({
        data: { orderId: updated.id, status, employeeId },
      });

      const createdNotification = await tx.notification.create({
        data: { customerId: updated.customerId, orderId: updated.id, message: orderStatusMessages[status] },
      });

      return { order: updated, notification: createdNotification };
    });

    emitOrderStatusChanged(order);
    emitNotification(order.customerId, notification);
    res.json(order);
  }),
);
