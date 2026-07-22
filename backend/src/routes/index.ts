import { Router } from 'express';
import { authRouter } from './auth.routes';
import { categoriesRouter } from './categories.routes';
import { productsRouter } from './products.routes';
import { ordersRouter } from './orders.routes';
import { addressesRouter } from './addresses.routes';
import { employeesRouter } from './employees.routes';
import { notificationsRouter } from './notifications.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/addresses', addressesRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/notifications', notificationsRouter);
