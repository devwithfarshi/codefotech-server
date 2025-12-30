import express, { Router } from 'express';
import { protect, authorize } from '@/common/middleware/auth.middleware';
import blogController from '../controllers/blog.controller';
import blogValidation from '../validations/blog.validation';
import validate from '@/common/middleware/validator.middlewares';
import { blogImageUpload } from '../utils/blog.upload';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management endpoints
 */

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all published blogs
 *     description: Get all published blogs with pagination
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of published blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get('/', blogController.getAllBlogs);

/**
 * @swagger
 * /blogs/admin:
 *   get:
 *     summary: Get all blogs (Admin)
 *     description: Get all blogs including unpublished ones (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of all blogs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin', protect, authorize('admin'), blogController.getAllBlogs);

/**
 * @swagger
 * /blogs/categories/admin:
 *   get:
 *     summary: Get all distinct categories (Admin)
 *     description: Get all distinct blog categories including unpublished blogs (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/categories/admin', protect, blogController.getAllCategoriesAdmin);

/**
 * @swagger
 * /blogs/categories:
 *   get:
 *     summary: Get all distinct categories
 *     description: Get all distinct blog categories from published blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', blogController.getAllCategories);

/**
 * @swagger
 * /blogs/category/{category}:
 *   get:
 *     summary: Get blogs by category
 *     description: Get all blogs in a specific category
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of blogs in category
 */
router.get('/category/:category', blogController.getBlogsByCategory);

/**
 * @swagger
 * /blogs/tag/{tag}:
 *   get:
 *     summary: Get blogs by tag
 *     description: Get all blogs with a specific tag
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of blogs with tag
 */
router.get('/tag/:tag', blogController.getBlogsByTag);

/**
 * @swagger
 * /blogs/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     description: Get a blog post by its URL slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: Blog details
 *       404:
 *         description: Blog not found
 */
router.get('/:slug', blogController.getBlogBySlug);

/**
 * @swagger
 * /blogs/id/{id}:
 *   get:
 *     summary: Get blog by ID
 *     description: Get a blog post by its ID (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */
router.get('/id/:id', protect, authorize('admin'), blogController.getBlogById);

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog
 *     description: Create a new blog post with optional image upload (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               content:
 *                 type: string
 *                 description: Blog content (HTML or Markdown)
 *               excerpt:
 *                 type: string
 *                 description: Short excerpt
 *               category:
 *                 type: string
 *                 description: Blog category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Blog tags
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Blog cover image
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     description: Update an existing blog post (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
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
 * @swagger
 * /blogs/{id}/toggle-publish:
 *   patch:
 *     summary: Toggle blog publish status
 *     description: Toggle the publish status of a blog post (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Publish status toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */
router.patch(
  '/:id/toggle-publish',
  protect,
  authorize('admin'),
  blogController.togglePublishStatus
);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Delete a blog post by ID (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */
router.delete('/:id', protect, authorize('admin'), blogController.deleteBlog);

export default router;
