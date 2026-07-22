import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL je obavezan'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET je obavezan'),
  CORS_ORIGIN: z.string().default('*'),
});

export const env = envSchema.parse(process.env);
