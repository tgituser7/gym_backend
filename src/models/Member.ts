import mongoose, { Schema, Document } from 'mongoose';
import { IMember } from '../types';

export type MemberDocument = Document & IMember;

const memberSchema = new Schema<MemberDocument>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    membershipStartDate: { type: Date, default: Date.now },
    membershipEndDate: { type: Date },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    emergencyContact: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Partial index: only enforces uniqueness when email is actually a string,
// allowing unlimited members without an email in the same branch.
memberSchema.index(
  { branch: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
memberSchema.index({ branch: 1, status: 1 });

export default mongoose.model<MemberDocument>('Member', memberSchema);
