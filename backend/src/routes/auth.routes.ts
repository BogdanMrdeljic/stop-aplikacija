import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';

export const authRouter = Router();

const SALT_ROUNDS = 10;

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  '/customers/register',
  asyncHandler(async (req, res) => {
    const { password, ...rest } = registerSchema.parse(req.body);

    const existing = await prisma.customer.findUnique({ where: { email: rest.email } });
    if (existing) throw new AppError(409, 'Nalog sa ovim emailom vec postoji');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const customer = await prisma.customer.create({
      data: { ...rest, passwordHash },
    });

    const token = signToken({ sub: customer.id, role: 'customer' });
    res.status(201).json({ token, customer: { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, email: customer.email } });
  }),
);

authRouter.post(
  '/customers/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      throw new AppError(401, 'Pogresan email ili lozinka');
    }

    const token = signToken({ sub: customer.id, role: 'customer' });
    res.json({ token, customer: { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, email: customer.email } });
  }),
);

authRouter.post(
  '/employees/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee || !(await bcrypt.compare(password, employee.passwordHash))) {
      throw new AppError(401, 'Pogresan email ili lozinka');
    }

    const token = signToken({ sub: employee.id, role: 'employee' });
    res.json({ token, employee: { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, email: employee.email } });
  }),
);
