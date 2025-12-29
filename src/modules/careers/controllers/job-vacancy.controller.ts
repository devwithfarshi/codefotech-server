import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import { Request, RequestHandler, Response } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';
import jobVacancyService from '../services/job-vacancy.service';
import jobApplicationService from '../services/job-application.service';
import { JobVacancyStatus } from '../types/job-vacancy.types';
import { UserRole } from '@/modules/user/types/user.types';

/**
 * Create a new job vacancy
 */
const createJobVacancy: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = req.body;
  const createdBy = new Types.ObjectId(req.user?._id);

  const vacancy = await jobVacancyService.createJobVacancy(createdBy, validatedData);

  res
    .status(status.CREATED)
    .json(new ApiResponse(status.CREATED, vacancy, 'Job vacancy created successfully'));
});

/**
 * Get job vacancy by ID
 */
const getJobVacancyById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { vacancyId } = req.params;
  const vacancy = await jobVacancyService.getJobVacancyById(new Types.ObjectId(vacancyId));

  if (!vacancy) {
    throw new ApiError(status.NOT_FOUND, 'Job vacancy not found');
  }

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, vacancy, 'Job vacancy retrieved successfully'));
});

/**
 * Get all job vacancies with pagination and filtering
 */
const getAllJobVacancies: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, department, status: vacancyStatus, sortBy, sortOrder } = req.query;

  const filters = {
    department: department as string,
    status: vacancyStatus as JobVacancyStatus,
  };
  const isAdmin = req.user?.role === UserRole.ADMIN;
  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: sortBy ? { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 } : undefined,
  };
  const vacancies = isAdmin
    ? await jobVacancyService.getAllJobVacanciesWithApplicationCount(filters, options)
    : await jobVacancyService.getAllJobVacancies(filters, options);

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, vacancies, 'Job vacancies retrieved successfully'));
});

/**
 * Update job vacancy by ID
 */
const updateJobVacancy: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { vacancyId } = req.params;
  const validatedData = req.body;

  const vacancy = await jobVacancyService.updateJobVacancy(
    new Types.ObjectId(vacancyId),
    validatedData
  );

  if (!vacancy) {
    throw new ApiError(status.NOT_FOUND, 'Job vacancy not found');
  }

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, vacancy, 'Job vacancy updated successfully'));
});

/**
 * Delete job vacancy by ID
 */
const deleteJobVacancy: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { vacancyId } = req.params;

  const deleted = await jobVacancyService.deleteJobVacancy(new Types.ObjectId(vacancyId));

  if (!deleted) {
    throw new ApiError(status.NOT_FOUND, 'Job vacancy not found');
  }

  res.status(status.OK).json(new ApiResponse(status.OK, null, 'Job vacancy deleted successfully'));
});

/**
 * Get job vacancy statistics
 */
const getJobVacancyStats: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const openVacancies = await jobVacancyService.getOpenVacanciesCount();
  const totalJobs = await jobVacancyService.gettotalJobsCount();
  const totalApplicants = await jobApplicationService.getTotalApplicationsCount();
  const stats = {
    openVacancies,
    totalJobs,
    totalApplicants,
  };

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, stats, 'Job vacancy statistics retrieved successfully'));
});

export {
  createJobVacancy,
  getJobVacancyById,
  getAllJobVacancies,
  updateJobVacancy,
  deleteJobVacancy,
  getJobVacancyStats,
};
