import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<SubscriptionTierDocument, {}, {}, {}, mongoose.Document<unknown, {}, SubscriptionTierDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & ISubscriptionTier & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SubscriptionTier.d.ts.map