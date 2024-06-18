import { z } from 'zod';

export const coachCancelZod = z.object({
  coachCancelReason: z.string(),
});

export const userCancelZod = z.object({
  userCancelReason: z.string(),
});
