import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  ngoId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  mediaUrls: string[]; // For project gallery
  status: 'planning' | 'active' | 'completed';
  needs: string[];
  budget?: number;
  raisedAmount?: number;
  volunteersNeeded?: number;
  volunteersJoined: mongoose.Types.ObjectId[]; // Users who signed up to help
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    ngoId: { type: Schema.Types.ObjectId, ref: 'Ngo', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    mediaUrls: [{ type: String }],
    status: { 
      type: String, 
      enum: ['planning', 'active', 'completed'], 
      default: 'planning' 
    },
    needs: [{ type: String }],
    budget: { type: Number },
    raisedAmount: { type: Number, default: 0 },
    volunteersNeeded: { type: Number },
    volunteersJoined: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
