import { IAttachment } from '@/types/common.types';
import {  PaginateOptions, Types } from 'mongoose';
import JobApplication from '../models/job-application.model';
import { IJobApplication } from '../types/job-application.types';

export interface CreateJobApplicationData {
  name: string;
  currentCompany?: string;
  currentJobRole?: string;
  social?: Record<string, string>;
  resume: IAttachment;
  coverLetter?: string;
  vacancyId: Types.ObjectId;
}

export interface UpdateJobApplicationData {
  name?: string;
  currentCompany?: string;
  currentJobRole?: string;
  social?: Record<string, string>;
  coverLetter?: string;
}

export interface JobApplicationFilters {
  vacancyId?: Types.ObjectId;
}

const jobApplicationService = {
  /**
   * Create a new job application
   */
  async createJobApplication(applicationData: CreateJobApplicationData): Promise<IJobApplication> {
    const application = new JobApplication(applicationData);
    return await application.save();
  },

  /**
   * Get job application by ID
   */
  async getJobApplicationById(applicationId: Types.ObjectId): Promise<IJobApplication | null> {
    return await JobApplication.findById(applicationId).populate({
      path: 'vacancyId',
      select: 'title department status',
      model: 'JobVacancy',
    });
  },

  /**
   * Get all job applications with pagination and filtering
   */
  async getAllJobApplications(
    filters: JobApplicationFilters = {},
    options: PaginateOptions = {}
  ): Promise<any> {
    const query: any= {};

    // Apply filters
    if (filters.vacancyId) {
      query.vacancyId = filters.vacancyId;
    }

    const paginateOptions: PaginateOptions = {
      page: options.page || 1,
      limit: options.limit || 10,
      sort: options.sort || { createdAt: -1 },
      populate: {
        path: 'vacancyId',
        select: 'title department status',
        model: 'JobVacancy',
      },
      ...options,
    };

    return await JobApplication.paginate(query, paginateOptions);
  },

  /**
   * Get applications by vacancy ID
   */
  async getApplicationsByVacancyId(
    vacancyId: Types.ObjectId,
    options: PaginateOptions = {}
  ): Promise<any> {
    const query:any = { vacancyId };

    const paginateOptions: PaginateOptions = {
      page: options.page || 1,
      limit: options.limit || 10,
      sort: options.sort || { createdAt: -1 },
      populate: {
        path: 'vacancyId',
        select: 'title department status',
        model: 'JobVacancy',
      },
      ...options,
    };

    return await JobApplication.paginate(query, paginateOptions);
  },

  /**
   * Update job application by ID
   */
  async updateJobApplication(
    applicationId: Types.ObjectId,
    updateData: UpdateJobApplicationData
  ): Promise<IJobApplication | null> {
    return await JobApplication.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'vacancyId',
      select: 'title department status',
      model: 'JobVacancy',
    });
  },

  /**
   * Delete job application by ID
   */
  async deleteJobApplication(applicationId: Types.ObjectId): Promise<boolean> {
    const result = await JobApplication.findByIdAndDelete(applicationId);
    return !!result;
  },

  /**
   * Check if application exists
   */
  async applicationExists(applicationId: Types.ObjectId): Promise<boolean> {
    const application = await JobApplication.findById(applicationId).select('_id');
    return !!application;
  },

  /**
   * Get applications count for a vacancy
   */
  async getApplicationsCountByVacancy(vacancyId: Types.ObjectId): Promise<number> {
    return await JobApplication.countDocuments({ vacancyId });
  },

  /**
   * Get total applications count
   */
  async getTotalApplicationsCount(): Promise<number> {
    return await JobApplication.countDocuments();
  },
  /**
   * Check if email has already applied to vacency
   */
  async hasAlreadyApplied(email: string, vacancyId: Types.ObjectId): Promise<boolean> {
    const application = await JobApplication.findOne({
      email,
      vacancyId,
    }).select('_id');
    return !!application;
  },
  /**
   * Check if email has already applied within the last 15 days
   */
  async hasAlreadyAppliedWithinFifteenDays(email: string): Promise<boolean> {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const application = await JobApplication.findOne({
      email,
      createdAt: { $gte: fifteenDaysAgo },
    }).select('_id');
    return !!application;
  },
};

export default jobApplicationService;
