import mongoose from 'mongoose';
import { IJobVacancy, JobVacancyStatus, JobVacancyStatusList } from '../types/job-vacancy.types';
import mongoosePaginate from 'mongoose-paginate-v2';

const JobVacancySchema = new mongoose.Schema<IJobVacancy>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    keyResponsibilities: {
      type: [String],
      default: [],
    },
    whatWeOffer: {
      type: [String],
      default: [],
    },
    openPositions: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: JobVacancyStatusList,
      default: JobVacancyStatus.OPEN,
    },

    salary: {
      type: String,
      required: true,
      trim: true,
    },
    salaryCurrency: {
      type: String,
      required: true,
      trim: true,
      default: 'USD',
    },
    deadline: {
      type: Date,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: false,
      trim: true,
    },
    locationType: {
      type: String,
      required: true,
      trim: true,
      default: 'Onsite',
    },
  },
  {
    timestamps: true,
  }
);

JobVacancySchema.plugin(mongoosePaginate);

// Create indexes for better performance
JobVacancySchema.index({ status: 1 });
JobVacancySchema.index({ department: 1 });
JobVacancySchema.index({ createdBy: 1 });
JobVacancySchema.index({ createdAt: -1 });

export default mongoose.model<IJobVacancy, mongoose.PaginateModel<IJobVacancy>>(
  'JobVacancy',
  JobVacancySchema
);
