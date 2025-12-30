import * as z from 'zod';
import { JobVacancyStatus } from '../types/job-vacancy.types';

/**
 * Job Vacancy validation schemas with Zod
 */
export const jobVacancyValidation: any = {
  /**
   * Create job vacancy validation schema
   */
  createJobVacancy: {
    body: z.object({
      title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be at most 200 characters')
        .trim(),

      department: z
        .string()
        .min(2, 'Department must be at least 2 characters')
        .max(100, 'Department must be at most 100 characters')
        .trim(),

      description: z
        .string()
        .min(50, 'Description must be at least 50 characters')
        .max(5000, 'Description must be at most 5000 characters')
        .trim(),

      skills: z
        .array(z.string().min(1, 'Skill cannot be empty'))
        .min(1, 'At least one skill is required')
        .max(20, 'Maximum 20 skills allowed'),

      requirements: z
        .array(z.string().min(1, 'Requirement cannot be empty'))
        .min(1, 'At least one requirement is required')
        .max(30, 'Maximum 30 requirements allowed')
        .optional()
        .default([]),

      keyResponsibilities: z
        .array(z.string().min(1, 'Responsibility cannot be empty'))
        .min(1, 'At least one key responsibility is required')
        .max(30, 'Maximum 30 key responsibilities allowed')
        .optional()
        .default([]),

      whatWeOffer: z
        .array(z.string().min(1, 'Offer cannot be empty'))
        .min(1, 'At least one offer is required')
        .max(30, 'Maximum 30 offers allowed')
        .optional()
        .default([]),

      openPositions: z
        .number()
        .int('Open positions must be an integer')
        .min(1, 'At least 1 open position is required')
        .max(100, 'Maximum 100 open positions allowed')
        .default(1),

      // NEW FIELDS ADDED BELOW

      salary: z
        .string()
        .min(1, 'Salary is required')
        .max(100, 'Salary must be at most 100 characters')
        .trim(),

      salaryCurrency: z
        .string()
        .min(1, 'Currency is required')
        .max(10, 'Currency must be at most 10 characters')
        .trim(),

      deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid deadline date'),

      jobType: z
        .string()
        .min(2, 'Job type must be at least 2 characters')
        .max(50, 'Job type must be at most 50 characters')
        .trim(),

      location: z.string().max(200, 'Location must be at most 200 characters').trim().optional(),

      locationType: z
        .string()
        .min(1, 'Location type is required')
        .max(50, 'Location type must be at most 50 characters')
        .trim(),
    }),
  },

  /**
   * Update job vacancy validation schema
   */
  updateJobVacancy: {
    body: z.object({
      title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be at most 200 characters')
        .trim()
        .optional(),
      department: z
        .string()
        .min(2, 'Department must be at least 2 characters')
        .max(100, 'Department must be at most 100 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .min(50, 'Description must be at least 50 characters')
        .max(5000, 'Description must be at most 5000 characters')
        .trim()
        .optional(),
      skills: z
        .array(z.string().min(1, 'Skill cannot be empty'))
        .min(1, 'At least one skill is required')
        .max(20, 'Maximum 20 skills allowed')
        .optional(),
      requirements: z
        .array(z.string().min(1, 'Requirement cannot be empty'))
        .min(1, 'At least one requirement is required')
        .max(30, 'Maximum 30 requirements allowed')
        .optional(),
      keyResponsibilities: z
        .array(z.string().min(1, 'Responsibility cannot be empty'))
        .min(1, 'At least one key responsibility is required')
        .max(30, 'Maximum 30 key responsibilities allowed')
        .optional(),
      whatWeOffer: z
        .array(z.string().min(1, 'Offer cannot be empty'))
        .min(1, 'At least one offer is required')
        .max(30, 'Maximum 30 offers allowed')
        .optional(),
      openPositions: z
        .number()
        .int('Open positions must be an integer')
        .min(1, 'At least 1 open position is required')
        .max(100, 'Maximum 100 open positions allowed')
        .optional(),
      salary: z
        .string()
        .min(1, 'Salary is required')
        .max(100, 'Salary must be at most 100 characters')
        .trim()
        .optional(),
      salaryCurrency: z
        .string()
        .min(1, 'Currency is required')
        .max(10, 'Currency must be at most 10 characters')
        .trim()
        .optional(),
      deadline: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid deadline date')
        .optional(),
      jobType: z
        .string()
        .min(2, 'Job type must be at least 2 characters')
        .max(50, 'Job type must be at most 50 characters')
        .trim()
        .optional(),
      location: z
        .string()
        .min(2, 'Location must be at least 2 characters')
        .max(200, 'Location must be at most 200 characters')
        .trim()
        .optional(),
      locationType: z
        .string()
        .min(1, 'Location type is required')
        .max(50, 'Location type must be at most 50 characters')
        .trim()
        .optional(),
      status: z.nativeEnum(JobVacancyStatus).optional(),
    }),
  },

  /**
   * Get job vacancies query validation schema
   */
  getJobVacancies: {
    query: z.object({
      page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, 'Page must be greater than 0')
        .optional(),
      limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
      department: z.string().optional(),
      status: z.nativeEnum(JobVacancyStatus).optional(),
      sortBy: z.enum(['createdAt', 'title', 'department', 'openPositions']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      q: z.string().optional(),
    }),
  },

  /**
   * Job vacancy ID parameter validation
   */
  jobVacancyId: {
    params: z.object({
      vacancyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vacancy ID format'),
    }),
  },
};

export default jobVacancyValidation;
