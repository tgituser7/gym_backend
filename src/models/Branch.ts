import mongoose, { Schema, Document } from 'mongoose';
import { IBranch } from '../types';

export type BranchDocument = Document & IBranch;

const branchSchema = new Schema<BranchDocument>(
  {
    gym: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    phone: { type: String, trim: true },
    openingHours: { type: String, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'Staff' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<BranchDocument>('Branch', branchSchema);
