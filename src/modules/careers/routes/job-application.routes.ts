import { authorize, protect } from '@/common/middleware/auth.middleware';
import validate from '@/common/middleware/validator.middlewares';
import type { Router as RouterType } from 'express';
import express from 'express';
import { UserRole } from '../../user/types/user.types';
import {
  createJobApplication,
  deleteJobApplication,
  getAllJobApplications,
  getApplicationsByVacancyId,
  getJobApplicationById,
  updateJobApplication,
} from '../controllers/job-application.controller';
import { resumeUpload } from '../middleware/upload.middleware';
import jobApplicationValidation from '../validations/job-application.validation';

const router: RouterType = express.Router();

/**
 * @route POST /api/v1/careers/applications
 * @desc Apply to a job (Create application)
 * @access Public
 */
router.post(
  '/',
  resumeUpload.single('resume'),
  validate(jobApplicationValidation.createJobApplication),
  createJobApplication
);

// Protected routes (require authentication and admin role)
router.use(protect);
router.use(authorize(UserRole.ADMIN));

/**
 * @route GET /api/v1/careers/applications
 * @desc Get all job applications (paginated with filters)
 * @access Private/Admin
 */
router.get('/', validate(jobApplicationValidation.getJobApplications), getAllJobApplications);

/**
 * @route GET /api/v1/careers/applications/vacancy/:vacancyId
 * @desc Get applications by vacancy ID
 * @access Private/Admin
 */
router.get(
  '/vacancy/:vacancyId',
  validate(jobApplicationValidation.vacancyIdParam),
  getApplicationsByVacancyId
);

/**
 * @route GET /api/v1/careers/applications/:applicationId
 * @desc Get job application by ID
 * @access Private/Admin
 */
router.get(
  '/:applicationId',
  validate(jobApplicationValidation.jobApplicationId),
  getJobApplicationById
);

/**
 * @route PUT /api/v1/careers/applications/:applicationId
 * @desc Update job application by ID
 * @access Private/Admin
 */
router.put(
  '/:applicationId',
  validate(jobApplicationValidation.jobApplicationId),
  validate(jobApplicationValidation.updateJobApplication),
  updateJobApplication
);

/**
 * @route DELETE /api/v1/careers/applications/:applicationId
 * @desc Delete job application by ID
 * @access Private/Admin
 */
router.delete(
  '/:applicationId',
  validate(jobApplicationValidation.jobApplicationId),
  deleteJobApplication
);

export default router;
