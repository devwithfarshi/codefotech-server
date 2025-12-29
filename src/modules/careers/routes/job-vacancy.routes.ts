import { authorize, protect } from '@/common/middleware/auth.middleware';
import validate from '@/common/middleware/validator.middlewares';
import type { Router as RouterType } from 'express';
import express from 'express';
import { UserRole } from '../../user/types/user.types';
import {
  createJobVacancy,
  deleteJobVacancy,
  getAllJobVacancies,
  getJobVacancyById,
  getJobVacancyStats,
  updateJobVacancy,
} from '../controllers/job-vacancy.controller';
import jobVacancyValidation from '../validations/job-vacancy.validation';

const router: RouterType = express.Router();

/**
 * @route GET /api/v1/careers/vacancies
 * @desc Get all job vacancies (paginated with filters)
 * @access Public
 */
router.get('/', validate(jobVacancyValidation.getJobVacancies), getAllJobVacancies);

/**
 * @route GET /api/v1/careers/vacancies/stats
 * @desc Get job vacancy statistics
 * @access Public
 */
router.get('/stats', getJobVacancyStats);

/**
 * @route GET /api/v1/careers/vacancies/:vacancyId
 * @desc Get job vacancy by ID
 * @access Public
 */
router.get('/:vacancyId', validate(jobVacancyValidation.jobVacancyId), getJobVacancyById);

// Protected routes (require authentication and admin role)
router.use(protect);
router.use(authorize(UserRole.ADMIN));
/**
 * @route GET /api/v1/careers/vacancies/admin
 * @desc Get all job vacancies (paginated with filters)
 * @access Admin
 */
router.get('/admin/all', validate(jobVacancyValidation.getJobVacancies), getAllJobVacancies);
/**
 * @route POST /api/v1/careers/vacancies
 * @desc Create a new job vacancy
 * @access Private/Admin
 */
router.post('/', validate(jobVacancyValidation.createJobVacancy), createJobVacancy);

/**
 * @route PUT /api/v1/careers/vacancies/:vacancyId
 * @desc Update job vacancy by ID
 * @access Private/Admin
 */
router.put(
  '/:vacancyId',
  validate(jobVacancyValidation.jobVacancyId),
  validate(jobVacancyValidation.updateJobVacancy),
  updateJobVacancy
);

/**
 * @route DELETE /api/v1/careers/vacancies/:vacancyId
 * @desc Delete job vacancy by ID
 * @access Private/Admin
 */
router.delete('/:vacancyId', validate(jobVacancyValidation.jobVacancyId), deleteJobVacancy);

export default router;
