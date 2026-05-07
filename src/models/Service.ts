import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '../types';

export type ServiceDocument = Document & IService;

const serviceSchema = new Schema<ServiceDocument>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, min: 1 },
    instructor: { type: Schema.Types.ObjectId, ref: 'Staff' },
    category: {
      type: String,
      enum: ['Yoga', 'Cardio', 'Strength', 'Pilates', 'Swimming', 'CrossFit', 'Martial Arts', 'Dance', 'Nutrition', 'Other'],
      default: 'Other',
    },
    schedule: { type: String, trim: true },
    maxCapacity: { type: Number, min: 1 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

serviceSchema.index({ branch: 1 });

export default mongoose.model<ServiceDocument>('Service', serviceSchema);
