import { z } from 'zod';

export const createZod = z
  .object({
    name: z.string(),
    coverImage: z.string(),
    description: z.string(),
    category:z.string().array().min(1),
    subCategory:z.string().array().min(1),
    startDate:z.string().date(),
    isActive:z.boolean(),
  });