import mongoose from 'mongoose';
import * as z from 'zod';
import { IAttachment } from '@/types/common.types';
import blogValidation from '../validations/blog.validation';

// Blog Interface
export interface IBlog extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  image: IAttachment;
  isPublished: boolean;
}

// Export inferred types from Zod schemas
export type CreateBlogType = z.infer<typeof blogValidation.createBlog.body>;
export type UpdateBlogType = z.infer<typeof blogValidation.updateBlog.body>;
