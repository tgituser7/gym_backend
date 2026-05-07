import mongoose, { Schema, Document } from 'mongoose';
import { IFee } from '../types';

export type FeeDocument = Document & IFee;

const feeSchema = new Schema<FeeDocument>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date },
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'online', 'other'] },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  },
  { timestamps: true }
);

feeSchema.index({ branch: 1, status: 1 });
feeSchema.index({ branch: 1, member: 1 });

export default mongoose.model<FeeDocument>('Fee', feeSchema);
