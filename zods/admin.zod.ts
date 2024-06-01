import { z } from 'zod';
const dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
const bankCodeRegex: RegExp = /^[a-zA-Z0-9]*$/;
export const adminUpdateCoachInfoZod = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  birthday: z.string().regex(dateRegex, { message: '日期格式必须是 YYYY-MM-DD' }).optional(),
  subject: z.string().optional(),
  specialty: z.string().optional(),
  language: z.array(z.object({ speakLanguage: z.string(), languageLevel: z.string() })).optional(),
  workExperience: z
    .object({
      startYear: z.string(),
      endYear: z.string(),
      startMonth: z.string(),
      endMonth: z.string(),
      department: z.string(),
      position: z.string(),
      title: z.string(),
    })
    .optional(),
  education: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
      schoolName: z.string(),
      major: z.string(),
      degree: z.string(),
    })
    .optional(),
  certifiedDocuments: z.array(z.string()).optional(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  bankAccount: z
    .string()
    .regex(bankCodeRegex, { message: 'Bank code must not contain special characters.' })
    .optional(),
});
