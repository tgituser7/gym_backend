import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionTier {
  name: string;
  basePrice: number;
  memberLimit: number;
  serviceLimit: number;
  staffLimit: number;
  additionalMemberPrice: number;
  additionalMemberUnit: number;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export type SubscriptionTierDocument = Document & ISubscriptionTier;

const subscriptionTierSchema = new Schema<SubscriptionTierDocument>(
  {
    name: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    memberLimit: { type: Number, required: true, min: 1 },
    serviceLimit: { type: Number, required: true, min: 1 },
    staffLimit: { type: Number, required: true, min: 0 },
    additionalMemberPrice: { type: Number, required: true, min: 0 },
    additionalMemberUnit: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<SubscriptionTierDocument>('SubscriptionTier', subscriptionTierSchema, 'subscriptiontiers');
