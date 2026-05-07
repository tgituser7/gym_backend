import mongoose, { Schema, Document } from 'mongoose';
import { IStaff } from '../types';

export type StaffDocument = Document & IStaff;

const staffSchema = new Schema<StaffDocument>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['Trainer', 'Instructor', 'Manager', 'Receptionist', 'Maintenance', 'Nutritionist', 'Other'],
    },
    specialization: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

staffSchema.index({ branch: 1, email: 1 }, { unique: true });

export default mongoose.model<StaffDocument>('Staff', staffSchema);
