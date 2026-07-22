import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';

export const employeesRouter = Router();

const SALT_ROUNDS = 10;

// Nema samostalne registracije - novog zaposlenog dodaje postojeci zaposleni
employeesRouter.use(requireAuth('employee'));

employeesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const employees = await prisma.employee.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      orderBy: { firstName: 'asc' },
    });
    res.json(employees);
  }),
);

const employeeInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

employeesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { password, ...rest } = employeeInputSchema.parse(req.body);

    const existing = await prisma.employee.findUnique({ where: { email: rest.email } });
    if (existing) throw new AppError(409, 'Zaposleni sa ovim emailom vec postoji');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const employee = await prisma.employee.create({ data: { ...rest, passwordHash } });

    res.status(201).json({ id: employee.id, firstName: employee.firstName, lastName: employee.lastName, email: employee.email });
  }),
);
