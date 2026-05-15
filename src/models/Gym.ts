import mongoose, { Schema, Document } from 'mongoose';
import { IGym } from '../types';

export type GymDocument = Document & IGym;

const gymSchema = new Schema<GymDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'blocked', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<GymDocument>('Gym', gymSchema);
