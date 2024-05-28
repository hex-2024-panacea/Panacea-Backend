import type { Document } from 'mongoose';
export interface IUser extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password: string;
  avatar: string;
  emailVerifiedAt: Date;
  isAdmin: boolean;
  isCoach: boolean;
  subject?: string;
  specialty?: string;
  profilePicture?: string;
  language?: [
    {
      language: string;
      level: string;
    },
  ];
  workExperience?: {
    startYear: string;
    endYear: string;
    startMonth: string;
    endMonth: string;
    department: string;
    position: string;
    title: string;
  };
  birthday: Date;
  education: {
    startDate: Date;
    endDate: Date;
    schoolName: string;
    major: string;
    degree: '學士' | '碩士' | '博士';
  };
  certifiedDocuments: string[];
  bankName: string;
  bankCode: string;
  bankAccount: string;
  earnings: Number;
  actualAmount: Number;
  approvalStatus: 'pending' | 'success' | 'failed';
}
