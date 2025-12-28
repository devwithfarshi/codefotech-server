import express, { Router } from 'express';
import { protect, authorize } from '@/common/middleware/auth.middleware';
import blogController from '../controllers/blog.controller';
import blogValidation from '../validations/blog.validation';
import validate from '@/common/middleware/validator.middlewares';
import { blogImageUpload } from '../utils/blog.upload';

const router: Router = express.Router();

/**
 * @route GET /api/v1/blogs
 * @desc Get all published blogs (paginated)
 * @access Public
 */
router.get('/', blogController.getPublishedBlogs);

/**
 * @route GET /api/v1/blogs/admin
 * @desc Get all blogs including unpublished (paginated)
 * @access Private/Admin
 */
router.get('/admin', protect, authorize('admin'), blogController.getAllBlogs);

/**
 * @route GET /api/v1/blogs/search
 * @desc Search blogs by title, content, excerpt, category, or tags
 * @access Public
 */
router.get('/search', blogController.searchBlogs);

/**
 * @route GET /api/v1/blogs/category/:category
 * @desc Get blogs by category (paginated)
 * @access Public
 */
router.get('/category/:category', blogController.getBlogsByCategory);

/**
 * @route GET /api/v1/blogs/tag/:tag
 * @desc Get blogs by tag (paginated)
 * @access Public
 */
router.get('/tag/:tag', blogController.getBlogsByTag);

/**
 * @route GET /api/v1/blogs/:slug
 * @desc Get blog by slug
 * @access Public (published only) / Private (all)
 */
router.get('/:slug', blogController.getBlogBySlug);

/**
 * @route GET /api/v1/blogs/id/:id
 * @desc Get blog by ID
 * @access Private/Admin
 */
router.get('/id/:id', protect, authorize('admin'), blogController.getBlogById);

/**
 * @route POST /api/v1/blogs
 * @desc Create a new blog with optional image upload
 * @access Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  blogImageUpload.single('image'),
  validate(blogValidation.createBlog),
  blogController.createBlog
);

/**
 * @route PUT /api/v1/blogs/:id
 * @desc Update a blog by ID with optional image upload
 * @access Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  blogImageUpload.single('image'),
  validate(blogValidation.updateBlog),
  blogController.updateBlog
);

/**
 * @route PATCH /api/v1/blogs/:id/toggle-publish
 * @desc Toggle blog publish status
 * @access Private/Admin
 */
router.patch(
  '/:id/toggle-publish',
  protect,
  authorize('admin'),
  blogController.togglePublishStatus
);

/**
 * @route DELETE /api/v1/blogs/:id
 * @desc Delete a blog by ID
 * @access Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), blogController.deleteBlog);

export default router;
