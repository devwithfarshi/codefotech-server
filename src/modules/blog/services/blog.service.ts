import { PaginateOptions, Types } from 'mongoose';
import Blog from '../models/blog.model';
import { CreateBlogType, IBlog, UpdateBlogType } from '../types/blog.types';

// Main blog service object
const blogService = {
  // Create a new blog
  async createBlog(blogData: CreateBlogType): Promise<IBlog> {
    const blog = new Blog(blogData);

    // Set publishedAt if blog is being published
    if (blogData.isPublished) {
      blog.publishedAt = new Date();
    }

    return await blog.save();
  },

  // Find blog by MongoDB ObjectId
  async getBlogById(blogId: Types.ObjectId): Promise<IBlog | null> {
    return await Blog.findById(blogId);
  },

  // Find blog by slug
  async getBlogBySlug(slug: string): Promise<IBlog | null> {
    return await Blog.findOne({ slug });
  },

  // Update blog fields by id
  async updateBlog(blogId: Types.ObjectId, updateData: UpdateBlogType): Promise<IBlog | null> {
    // If updating to published and no publishedAt, set it
    const blog = await Blog.findById(blogId);
    if (blog && updateData.isPublished && !blog.publishedAt) {
      (updateData as any).publishedAt = new Date();
    }

    return await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  // Delete a blog
  async deleteBlog(blogId: string): Promise<boolean> {
    const result = await Blog.deleteOne({ _id: blogId });
    return result.deletedCount > 0;
  },

  // Paginated list of all blogs (with optional query and options)
  async getAllBlogs(query: object = {}, options: PaginateOptions = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
    };

    return await Blog.paginate(query, paginateOptions);
  },

  // Get all published blogs (paginated)
  async getPublishedBlogs(options: PaginateOptions = {}) {
    const { page = 1, limit = 10, sort = '-publishedAt' } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
    };

    return await Blog.paginate({ isPublished: true }, paginateOptions);
  },

  // Get blogs by category (paginated)
  async getBlogsByCategory(category: string, options: PaginateOptions = {}) {
    const { page = 1, limit = 10, sort = '-publishedAt' } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
    };

    return await Blog.paginate({ category, isPublished: true }, paginateOptions);
  },

  // Get blogs by tag (paginated)
  async getBlogsByTag(tag: string, options: PaginateOptions = {}) {
    const { page = 1, limit = 10, sort = '-publishedAt' } = options;

    const paginateOptions = {
      page,
      limit,
      sort,
    };

    return await Blog.paginate({ tags: tag, isPublished: true }, paginateOptions);
  },

  // Search blogs by title, content, or excerpt (case-insensitive)
  async searchBlogs(searchTerm: string, options: PaginateOptions = {}) {
    const { page = 1, limit = 10, sort = '-publishedAt' } = options;

    const searchQuery = {
      isPublished: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const paginateOptions = {
      page,
      limit,
      sort,
    };

    return await Blog.paginate(searchQuery, paginateOptions);
  },

  // Check if slug exists
  async checkSlugExists(slug: string): Promise<boolean> {
    const blog = await Blog.findOne({ slug });
    return !!blog;
  },

  // Check if slug exists (excluding a specific blog by ID)
  async checkSlugExistsExcludingId(slug: string, excludeId: Types.ObjectId): Promise<boolean> {
    const blog = await Blog.findOne({ slug, _id: { $ne: excludeId } });
    return !!blog;
  },

  // Toggle blog publish status
  async togglePublishStatus(blogId: string): Promise<IBlog | null> {
    const blog = await Blog.findById(blogId);
    if (!blog) return null;

    const updateData: any = { isPublished: !blog.isPublished };

    // Set publishedAt when publishing for the first time
    if (!blog.isPublished && !blog.publishedAt) {
      updateData.publishedAt = new Date();
    }

    return await Blog.findByIdAndUpdate(blogId, { $set: updateData }, { new: true });
  },
};

export default blogService;
