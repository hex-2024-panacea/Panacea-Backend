import { language } from 'googleapis/build/src/apis/language';
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

export const registerCoachZod = z.object({
  subject: z.string(),
  specialty: z.string(),
  language: z.array(z.object({ speakLanguage: z.string(), languageLevel: z.string() })),
  workExperience: z.object({
    startYear: z.string(),
    endYear: z.string(),
    startMonth: z.string(),
    endMonth: z.string(),
    department: z.string(),
    position: z.string(),
    title: z.string(),
  }),
  education: z.object({
    startDate: z.string(),
    endDate: z.string(),
    schoolName: z.string(),
    major: z.string(),
    degree: z.string(),
  }),
  certifiedDocuments: z.array(z.string()),
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

export const updatePasswordZod = z
  .object({
    password: z.string().min(8),
    newPassword: z.string().min(8),
    newPasswordConfirm: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "new Password don't match",
    path: ['newPasswordConfirm'],
  });
