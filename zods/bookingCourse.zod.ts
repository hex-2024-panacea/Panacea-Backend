import { z } from 'zod';
import type { ObjectId } from 'bson';

export const coachCancelZod = z.object({
  coachCancelReason: z.string(),
});

export const userCancelZod = z.object({
  userCancelReason: z.string(),
});

export const createZod = z.object({
  user: z.custom<ObjectId>(),
  course: z.custom<ObjectId>(),
  coach: z.custom<ObjectId>(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  courseSchedule: z.custom<ObjectId>(),
  meetingUrl: z.string(),
  order: z.custom<ObjectId>(),
});
