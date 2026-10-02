import mongoose, { Document, Schema } from 'mongoose';

export interface INgo extends Document {
  userId: mongoose.Types.ObjectId;
  mission: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categories: string[];
  location?: string;
  establishedYear?: number;
  contactEmail?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ngoSchema = new Schema<INgo>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    mission: { type: String, required: true },
    website: { type: String },
    logoUrl: { type: String },
    coverImageUrl: { type: String },
    categories: [{ type: String }],
    location: { type: String },
    establishedYear: { type: Number },
    contactEmail: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Ngo = mongoose.model<INgo>('Ngo', ngoSchema);
