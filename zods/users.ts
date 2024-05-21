import { z } from 'zod';

export const registerZod = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password don't match",
    path: ['confirmPassword'],
  });

export const signinZod = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyEmailZod = z.object({
  email: z.string().email(),
});

export const resetPasswordZod = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password don't match",
    path: ['confirmPassword'],
  });
