import mongoose from 'mongoose';
import { IAttachment } from '@/types/common.types';

// Job Application Interface
export interface IJobApplication extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  currentCompany?: string;
  currentJobRole?: string;
  social?: Record<string, string>;
  resume: IAttachment;
  coverLetter?: string;
  vacancyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
