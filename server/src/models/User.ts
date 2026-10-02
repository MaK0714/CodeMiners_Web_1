import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  supabaseId?: string;
  email: string;
  password?: string;
  role: 'supporter' | 'ngo' | 'foundation';
  name: string;
  profilePic?: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    supabaseId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['supporter', 'ngo', 'foundation'], 
      default: 'supporter' 
    },
    name: { type: String, required: true },
    profilePic: { type: String },
    bio: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
