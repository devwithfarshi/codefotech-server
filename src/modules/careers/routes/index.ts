import type { Router as RouterType } from 'express';
import express from 'express';
import jobVacancyRoutes from './job-vacancy.routes';
import jobApplicationRoutes from './job-application.routes';

const router: RouterType = express.Router();

/**
 * Careers module routes
 * Base path: /api/v1/careers
 */

// Job vacancy routes
router.use('/vacancies', jobVacancyRoutes);

// Job application routes
router.use('/applications', jobApplicationRoutes);

export default router;
