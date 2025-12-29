import mongoose from 'mongoose';

// Job Vacancy Status Enum
export enum JobVacancyStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

// Job Vacancy Status List
export const JobVacancyStatusList = Object.values(JobVacancyStatus);

// Job Vacancy Interface
export interface IJobVacancy extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  department: string;
  description: string;
  skills: string[];
  requirements: string[];
  keyResponsibilities: string[];
  whatWeOffer: string[];
  openPositions: number;
  createdBy: mongoose.Types.ObjectId;
  status: JobVacancyStatus;
  createdAt: Date;
  updatedAt: Date;

  // NEW FIELDS
  salary: string;
  salaryCurrency: string;
  deadline: Date;
  jobType: string;
  location?: string;
  locationType: string;
}
