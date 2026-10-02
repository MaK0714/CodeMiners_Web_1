import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  projectId?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  type: 'update' | 'milestone' | 'need' | 'general';
  content: string;
  mediaUrls: string[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['update', 'milestone', 'need', 'general'], 
      default: 'general' 
    },
    content: { type: String, required: true },
    mediaUrls: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>('Post', postSchema);
