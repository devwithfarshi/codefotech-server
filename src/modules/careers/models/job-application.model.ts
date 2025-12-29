import mongoose from 'mongoose';
import { IJobApplication } from '../types/job-application.types';
import { IAttachment } from '@/types/common.types';
import mongoosePaginate from 'mongoose-paginate-v2';

const AttachmentSchema = new mongoose.Schema<IAttachment>(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const JobApplicationSchema = new mongoose.Schema<IJobApplication>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    currentJobRole: {
      type: String,
      trim: true,
    },
    social: {
      type: Map,
      of: String,
    },
    resume: {
      type: AttachmentSchema,
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    vacancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobVacancy',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

JobApplicationSchema.plugin(mongoosePaginate);

// Create indexes for better performance
JobApplicationSchema.index({ vacancyId: 1 });
JobApplicationSchema.index({ createdAt: -1 });
// Compound index for checking duplicate applications within time period
JobApplicationSchema.index({ email: 1, vacancyId: 1, createdAt: -1 });

export default mongoose.model<IJobApplication, mongoose.PaginateModel<IJobApplication>>(
  'JobApplication',
  JobApplicationSchema
);
