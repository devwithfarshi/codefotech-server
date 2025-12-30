import * as z from 'zod';

/**
 * Blog validation schemas with Zod
 */
export const blogValidation = {
  /**
   * Create blog validation schema
   */
  createBlog: {
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be at most 200 characters'),
      slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(200, 'Slug must be at most 200 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)'),
      excerpt: z
        .string()
        .min(10, 'Excerpt must be at least 10 characters')
        .max(500, 'Excerpt must be at most 500 characters'),
      content: z.string().min(50, 'Content must be at least 50 characters'),
      category: z
        .string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be at most 50 characters'),
      tags: z
        .array(
          z.string().min(1, 'Tag cannot be empty').max(30, 'Tag must be at most 30 characters')
        )
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags allowed'),
      isPublished: z
        .string()
        .transform((val) => val === 'true')
        .or(z.boolean())
        .optional()
        .default(false),
    }),
  },

  /**
   * Update blog validation schema
   */
  updateBlog: {
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be at most 200 characters')
        .optional(),
      slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(200, 'Slug must be at most 200 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)')
        .optional(),
      excerpt: z
        .string()
        .min(10, 'Excerpt must be at least 10 characters')
        .max(500, 'Excerpt must be at most 500 characters')
        .optional(),
      content: z.string().min(50, 'Content must be at least 50 characters').optional(),
      category: z
        .string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be at most 50 characters')
        .optional(),
      tags: z
        .array(
          z.string().min(1, 'Tag cannot be empty').max(30, 'Tag must be at most 30 characters')
        )
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
      isPublished: z
        .string()
        .transform((val) => val === 'true')
        .or(z.boolean())
        .optional()
        .default(false),
    }),
  },
};

export default blogValidation;
