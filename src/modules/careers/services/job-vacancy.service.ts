import {  PaginateOptions, Types } from 'mongoose';
import JobVacancy from '../models/job-vacancy.model';
import { IJobVacancy, JobVacancyStatus } from '../types/job-vacancy.types';

export interface CreateJobVacancyData {
  title: string;
  department: string;
  description: string;
  skills: string[];
  openPositions: number;
}

export interface UpdateJobVacancyData {
  title?: string;
  department?: string;
  description?: string;
  skills?: string[];
  openPositions?: number;
  status?: JobVacancyStatus;
}

export interface JobVacancyFilters {
  department?: string;
  status?: JobVacancyStatus;
}

const jobVacancyService = {
  /**
   * Create a new job vacancy
   */
  async createJobVacancy(
    createdBy: Types.ObjectId,
    vacancyData: CreateJobVacancyData
  ): Promise<IJobVacancy> {
    const vacancy = new JobVacancy({
      ...vacancyData,
      createdBy,
    });
    return await vacancy.save();
  },

  /**
   * Get job vacancy by ID
   */
  async getJobVacancyById(vacancyId: Types.ObjectId): Promise<IJobVacancy | null> {
    return await JobVacancy.findById(vacancyId).populate({
      path: 'createdBy',
      select: 'name email',
      model: 'User',
    });
  },

  /**
   * Get all job vacancies with pagination and filtering
   */
  async getAllJobVacancies(
    filters: JobVacancyFilters = {},
    options: PaginateOptions = {}
  ): Promise<any> {
    const query:any = {};

    // Apply filters
    if (filters.department) {
      query.department = new RegExp(filters.department, 'i');
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const paginateOptions: PaginateOptions = {
      page: options.page || 1,
      limit: options.limit || 10,
      sort: options.sort || { createdAt: -1 },
      populate: {
        path: 'createdBy',
        select: 'name email',
        model: 'User',
      },
      ...options,
    };
    const openVacancies = await jobVacancyService.getOpenVacanciesCount();
    const results = await JobVacancy.paginate(query, paginateOptions);
    return {
      ...results,
      openVacancies,
    };
  },

  /**
   * Get all job vacancies with application counts (for admin)
   */
  async getAllJobVacanciesWithApplicationCount(
    filters: JobVacancyFilters = {},
    options: PaginateOptions = {}
  ): Promise<any> {
    const query: any = {};

    // Apply filters
    if (filters.department) {
      query.department = new RegExp(filters.department, 'i');
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const sort = options.sort || { createdAt: -1 };

    // Use aggregation to get application counts
    const aggregation: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'jobapplications',
          localField: '_id',
          foreignField: 'vacancyId',
          as: 'applications',
        },
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' },
        },
      },
      {
        $project: {
          applications: 0,
          createdBy: 0,
          requirements: 0,
          keyResponsibilities: 0,
          whatWeOffer: 0,
        },
      },
      { $sort: sort },
    ];

    const countAggregation: any[] = [...aggregation, { $count: 'total' }];
    const dataAggregation: any[] = [
      ...aggregation,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const [countResult, docs] = await Promise.all([
      JobVacancy.aggregate(countAggregation),
      JobVacancy.aggregate(dataAggregation),
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      docs,
      totalDocs: total,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      pagingCounter: (page - 1) * limit + 1,
    };
  },

  /**
   * Update job vacancy by ID
   */
  async updateJobVacancy(
    vacancyId: Types.ObjectId,
    updateData: UpdateJobVacancyData
  ): Promise<IJobVacancy | null> {
    return await JobVacancy.findByIdAndUpdate(
      vacancyId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'createdBy',
      select: 'name email',
      model: 'User',
    });
  },

  /**
   * Delete job vacancy by ID
   */
  async deleteJobVacancy(vacancyId: Types.ObjectId): Promise<boolean> {
    const result = await JobVacancy.findByIdAndDelete(vacancyId);
    return !!result;
  },

  /**
   * Check if job vacancy exists
   */
  async vacancyExists(vacancyId: Types.ObjectId) {
    const vacancy = await JobVacancy.findById(vacancyId).select('_id title');
    return vacancy;
  },

  /**
   * Get open job vacancies count
   */
  async getOpenVacanciesCount(): Promise<number> {
    const result = await JobVacancy.aggregate([
      { $match: { status: JobVacancyStatus.OPEN } },
      { $group: { _id: null, totalOpenPositions: { $sum: '$openPositions' } } },
    ]);
    return result[0]?.totalOpenPositions || 0;
  },

  /**
   * Get total vacancies count
   */
  async gettotalJobsCount(): Promise<number> {
    return await JobVacancy.countDocuments();
  },

  /**
   * Update vacancy status
   */
  async updateVacancyStatus(
    vacancyId: Types.ObjectId,
    status: JobVacancyStatus
  ): Promise<IJobVacancy | null> {
    return await JobVacancy.findByIdAndUpdate(
      vacancyId,
      { $set: { status } },
      { new: true, runValidators: true }
    );
  },
};

export default jobVacancyService;
