import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IBlog } from '../types/blog.types';

// Attachment subdocument schema
const AttachmentSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const BlogSchema = new mongoose.Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readTime: {
      type: String,
      required: true,
    },
    image: {
      type: AttachmentSchema,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Record<string, any>) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Pre-save hook to set publishedAt when blog is published
BlogSchema.pre('save', function () {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

BlogSchema.plugin(mongoosePaginate);

// Create indexes for better performance
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ isPublished: 1 });

export default mongoose.model<IBlog, mongoose.PaginateModel<IBlog>>('Blog', BlogSchema);
