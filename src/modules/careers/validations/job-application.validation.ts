import * as z from 'zod';

/**
 * Job Application validation schemas with Zod
 */
export const jobApplicationValidation: any = {
  /**
   * Create job application validation schema
   */
  createJobApplication: {
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .trim(),
      email: z.email('Invalid email format').max(100, 'Email must be at most 100 characters'),
      phone: z
        .string()
        .min(7, 'Phone number must be at least 7 characters')
        .max(20, 'Phone number must be at most 20 characters')
        .trim(),
      currentCompany: z
        .string()
        .max(100, 'Company name must be at most 100 characters')
        .trim()
        .optional(),
      currentJobRole: z
        .string()
        .max(1000, 'Job role must be at most 1000 characters')
        .trim()
        .optional(),
      social: z.record(z.string(), z.string().url('Invalid URL format')).optional(),
      coverLetter: z
        .string()
        .max(2000, 'Cover letter must be at most 2000 characters')
        .trim()
        .optional(),
      vacancyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vacancy ID format'),
    }),
  },

  /**
   * Update job application validation schema
   */
  updateJobApplication: {
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .trim()
        .optional(),
      email: z.email('Invalid email format').max(100, 'Email must be at most 100 characters'),
      phone: z
        .string()
        .min(7, 'Phone number must be at least 7 characters')
        .max(20, 'Phone number must be at most 20 characters')
        .trim()
        .optional(),
      currentCompany: z
        .string()
        .max(100, 'Company name must be at most 100 characters')
        .trim()
        .optional(),
      currentJobRole: z
        .string()
        .max(1000, 'Job role must be at most 1000 characters')
        .trim()
        .optional(),
      social: z.record(z.string(), z.string().url('Invalid URL format')).optional(),
      coverLetter: z
        .string()
        .max(2000, 'Cover letter must be at most 2000 characters')
        .trim()
        .optional(),
    }),
  },

  /**
   * Get job applications query validation schema
   */
  getJobApplications: {
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
      vacancyId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid vacancy ID format')
        .optional(),
      sortBy: z.enum(['createdAt', 'name']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  },

  /**
   * Job application ID parameter validation
   */
  jobApplicationId: {
    params: z.object({
      applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
    }),
  },

  /**
   * Vacancy ID parameter validation
   */
  vacancyIdParam: {
    params: z.object({
      vacancyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vacancy ID format'),
    }),
  },
};

export default jobApplicationValidation;
