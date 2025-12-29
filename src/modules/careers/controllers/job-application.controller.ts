import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import { IAttachment } from '@/types/common.types';
import { Request, RequestHandler, Response } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';
import jobApplicationService from '../services/job-application.service';
import jobVacancyService from '../services/job-vacancy.service';
import sendEmail from '@/common/utils/sendEmail';

/**
 * Create a new job application (Apply to a job)
 */
const createJobApplication: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = req.body;

  // Check if vacancy exists
  const vacancyExists = await jobVacancyService.vacancyExists(
    new Types.ObjectId(validatedData.vacancyId)
  );
  if (!vacancyExists) {
    throw new ApiError(status.NOT_FOUND, 'Job vacancy not found');
  }
  const alreadyApplied = await jobApplicationService.hasAlreadyApplied(
    validatedData.email,
    new Types.ObjectId(validatedData.vacancyId)
  );
  if (alreadyApplied) {
    throw new ApiError(
      status.BAD_REQUEST,
      'You have already applied to this position within the last 15 days. Please try again later.'
    );
  }
  const alreadyAppliedWithInFifteenDays =
    await jobApplicationService.hasAlreadyAppliedWithinFifteenDays(validatedData.email);
  if (alreadyAppliedWithInFifteenDays) {
    throw new ApiError(
      status.BAD_REQUEST,
      'You have already applied to a position within the last 15 days. Please try again later.'
    );
  }
  // Process uploaded resume file
  if (!req.file) {
    throw new ApiError(status.BAD_REQUEST, 'Resume file is required');
  }

  const resume: IAttachment = {
    public_id: req.file.filename.split('.')[0],
    url: `/uploads/resumes/${req.file.filename}`,
  };

  const applicationData = {
    ...validatedData,
    resume,
    vacancyId: new Types.ObjectId(validatedData.vacancyId),
  };

  const application = await jobApplicationService.createJobApplication(applicationData);
  await sendEmail(
    application.email,
    `Application confirmation - ${vacancyExists.title}`,
    null,
    null,
    `<p>Dear applicant,</p>
<p>Thanks for feeing the interest to join our team! Your application has been received and is currently under review. If match with our enthusiasm, we will knock you soon.</p>
<p>Best regards,<br/>Human Resource Department<br/>CodeFoTech</p>
<p><i><b>N.B: This is an automated mail. Need not any reply.</b></i></p>`
  );
  await sendEmail(
    'careers@codefotech.com',
    `New Job Application Received - ${vacancyExists.title}`,
    null,
    null,
    `<p>Dear Sir,</p>
<p>The applicant ${application.name} has recently applied for the position ${vacancyExists.title}. Click the <a href="${process.env.FRONTEND_URL}/careers/${vacancyExists._id}/applicants">link</a> for detail.</p>
<p>Thanks</p>`
  );
  res
    .status(status.CREATED)
    .json(new ApiResponse(status.CREATED, application, 'Application submitted successfully'));
});

/**
 * Get job application by ID
 */
const getJobApplicationById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const application = await jobApplicationService.getJobApplicationById(
    new Types.ObjectId(applicationId)
  );

  if (!application) {
    throw new ApiError(status.NOT_FOUND, 'Job application not found');
  }

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, application, 'Job application retrieved successfully'));
});

/**
 * Get all job applications with pagination and filtering
 */
const getAllJobApplications: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, vacancyId, sortBy, sortOrder } = req.query;

  const filters = {
    vacancyId: vacancyId ? new Types.ObjectId(vacancyId as string) : undefined,
  };

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: sortBy ? { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 } : undefined,
  };

  const applications = await jobApplicationService.getAllJobApplications(filters, options);

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, applications, 'Job applications retrieved successfully'));
});

/**
 * Get applications by vacancy ID
 */
const getApplicationsByVacancyId: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { vacancyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if vacancy exists
    const vacancyExists = await jobVacancyService.vacancyExists(new Types.ObjectId(vacancyId));
    if (!vacancyExists) {
      throw new ApiError(status.NOT_FOUND, 'Job vacancy not found');
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
    };

    const applications = await jobApplicationService.getApplicationsByVacancyId(
      new Types.ObjectId(vacancyId),
      options
    );

    res
      .status(status.OK)
      .json(new ApiResponse(status.OK, applications, 'Applications retrieved successfully'));
  }
);

/**
 * Update job application by ID
 */
const updateJobApplication: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const validatedData = req.body;

  const application = await jobApplicationService.updateJobApplication(
    new Types.ObjectId(applicationId),
    validatedData
  );

  if (!application) {
    throw new ApiError(status.NOT_FOUND, 'Job application not found');
  }

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, application, 'Job application updated successfully'));
});

/**
 * Delete job application by ID
 */
const deleteJobApplication: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const deleted = await jobApplicationService.deleteJobApplication(
    new Types.ObjectId(applicationId)
  );

  if (!deleted) {
    throw new ApiError(status.NOT_FOUND, 'Job application not found');
  }

  res
    .status(status.OK)
    .json(new ApiResponse(status.OK, null, 'Job application deleted successfully'));
});

export {
  createJobApplication,
  getJobApplicationById,
  getAllJobApplications,
  getApplicationsByVacancyId,
  updateJobApplication,
  deleteJobApplication,
};
