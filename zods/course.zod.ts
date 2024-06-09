import { z } from 'zod';
import type { ObjectId } from 'bson';

export const createZod = z
  .object({
    coach: z.custom<ObjectId>(),
    name: z.string(),
    coverImage: z.string(),
    description: z.string(),
    category:z.string().array().min(1),
    subCategory:z.string().array().min(1),
    startDate:z.string().date(),
    isActive:z.boolean(),
  });
export const priceZod = z
.object({
  id: z.custom<ObjectId>().optional(),
  course: z.custom<ObjectId>(),
  count: z.number(),
  price: z.number(),
});
export const editPriceZod = z.array(priceZod);
export const scheduleZod = z
.object({
  id: z.custom<ObjectId>().optional(),
  coach: z.custom<ObjectId>(),
  course: z.custom<ObjectId>(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
export const editScheduleZod = z.array(scheduleZod);