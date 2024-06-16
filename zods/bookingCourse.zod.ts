import { z } from 'zod';

export const coachCancelZod = z.object({
  coachCancelRemark: z.string(),
});

export const userCancelZod = z.object({
  userCancelRemark: z.string(),
});
