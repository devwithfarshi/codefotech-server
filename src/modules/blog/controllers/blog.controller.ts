import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';
import blogService from '../services/blog.service';
import { renameImageToSlug, deleteBlogImage, deleteTempFile } from '../utils/blog.upload';

const blogController = {
  // Create a new blog
  createBlog: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogData = req.body;

    // Check if slug already exists
    const slugExists = await blogService.checkSlugExists(blogData.slug);
    if (slugExists) {
      // Clean up uploaded file if slug already exists
      if (req.file) {
        deleteTempFile(req.file.path);
      }
      return next(ApiError.conflict('A blog with this slug already exists'));
    }

    // Handle image upload
    if (req.file) {
      try {
        const imageData = renameImageToSlug(req.file.path, blogData.slug);
        blogData.image = {
          public_id: imageData.public_id,
          url: imageData.url,
        };
      } catch (error) {
        // Clean up temp file on error
        deleteTempFile(req.file.path);
        return next(ApiError.internal('Failed to process image upload'));
      }
    }

    const blog = await blogService.createBlog(blogData);

    const response = new ApiResponse(status.CREATED, { blog }, 'Blog created successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get all blogs (paginated) - Admin
  getAllBlogs: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const blogs = await blogService.getAllBlogs({}, { page, limit });

    const response = new ApiResponse(status.OK, blogs, 'Blogs retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get published blogs (paginated) - Public
  getPublishedBlogs: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const blogs = await blogService.getPublishedBlogs({ page, limit });

    const response = new ApiResponse(status.OK, blogs, 'Published blogs retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get blog by slug - Public
  getBlogBySlug: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    const blog = await blogService.getBlogBySlug(slug);

    if (!blog) {
      return next(ApiError.notFound('Blog not found'));
    }

    // If blog is not published, only allow access if user is authenticated (admin)
    if (!blog.isPublished && !req.user) {
      return next(ApiError.notFound('Blog not found'));
    }

    const response = new ApiResponse(status.OK, { blog }, 'Blog retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get blog by ID - Admin
  getBlogById: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(blogId)) {
      return next(ApiError.badRequest('Invalid blog ID format'));
    }

    const blog = await blogService.getBlogById(new Types.ObjectId(blogId));

    if (!blog) {
      return next(ApiError.notFound('Blog not found'));
    }

    const response = new ApiResponse(status.OK, { blog }, 'Blog retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Update blog by ID
  updateBlog: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;
    const updateData = req.body;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(blogId)) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        deleteTempFile(req.file.path);
      }
      return next(ApiError.badRequest('Invalid blog ID format'));
    }

    // Get existing blog to check for existing image
    const existingBlog = await blogService.getBlogById(new Types.ObjectId(blogId));
    if (!existingBlog) {
      // Clean up uploaded file if blog not found
      if (req.file) {
        deleteTempFile(req.file.path);
      }
      return next(ApiError.notFound('Blog not found'));
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug) {
      const slugExists = await blogService.checkSlugExistsExcludingId(
        updateData.slug,
        new Types.ObjectId(blogId)
      );
      if (slugExists) {
        // Clean up uploaded file if slug conflict
        if (req.file) {
          deleteTempFile(req.file.path);
        }
        return next(ApiError.conflict('A blog with this slug already exists'));
      }
    }

    // Handle image upload
    if (req.file) {
      try {
        // Delete existing image if present
        if (existingBlog.image && existingBlog.image.public_id) {
          deleteBlogImage(existingBlog.image.public_id);
        }

        // Use new slug if provided, otherwise use existing slug
        const slugToUse = updateData.slug || existingBlog.slug;
        const imageData = renameImageToSlug(req.file.path, slugToUse);
        updateData.image = {
          public_id: imageData.public_id,
          url: imageData.url,
        };
      } catch (error) {
        // Clean up temp file on error
        deleteTempFile(req.file.path);
        return next(ApiError.internal('Failed to process image upload'));
      }
    }

    const updatedBlog = await blogService.updateBlog(new Types.ObjectId(blogId), updateData);

    if (!updatedBlog) {
      return next(ApiError.notFound('Blog not found'));
    }

    const response = new ApiResponse(status.OK, { blog: updatedBlog }, 'Blog updated successfully');
    res.status(response.statusCode).json(response);
  }),

  // Delete blog by ID
  deleteBlog: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(blogId)) {
      return next(ApiError.badRequest('Invalid blog ID format'));
    }

    // Get blog to delete its image
    const blog = await blogService.getBlogById(new Types.ObjectId(blogId));
    if (!blog) {
      return next(ApiError.notFound('Blog not found'));
    }

    // Delete image file if exists
    if (blog.image && blog.image.public_id) {
      deleteBlogImage(blog.image.public_id);
    }

    const deleted = await blogService.deleteBlog(blogId);

    if (!deleted) {
      return next(ApiError.notFound('Blog not found'));
    }

    const response = new ApiResponse(status.OK, null, 'Blog deleted successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get blogs by category - Public
  getBlogsByCategory: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const blogs = await blogService.getBlogsByCategory(category, { page, limit });

    const response = new ApiResponse(status.OK, blogs, 'Blogs retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get blogs by tag - Public
  getBlogsByTag: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { tag } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const blogs = await blogService.getBlogsByTag(tag, { page, limit });

    const response = new ApiResponse(status.OK, blogs, 'Blogs retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Search blogs - Public
  searchBlogs: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return next(ApiError.badRequest('Search term is required'));
    }

    const blogs = await blogService.searchBlogs(searchTerm.trim(), { page, limit });

    const response = new ApiResponse(status.OK, blogs, 'Search results retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Toggle publish status - Admin
  togglePublishStatus: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(blogId)) {
      return next(ApiError.badRequest('Invalid blog ID format'));
    }

    const blog = await blogService.togglePublishStatus(blogId);

    if (!blog) {
      return next(ApiError.notFound('Blog not found'));
    }

    const message = blog.isPublished
      ? 'Blog published successfully'
      : 'Blog unpublished successfully';
    const response = new ApiResponse(status.OK, { blog }, message);
    res.status(response.statusCode).json(response);
  }),
};

export default blogController;
