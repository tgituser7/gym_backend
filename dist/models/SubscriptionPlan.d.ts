import mongoose, { Document } from 'mongoose';
export interface ISubscriptionPlan {
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
export type SubscriptionPlanDocument = Document & ISubscriptionPlan;
declare const _default: mongoose.Model<SubscriptionPlanDocument, {}, {}, {}, mongoose.Document<unknown, {}, SubscriptionPlanDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & ISubscriptionPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SubscriptionPlan.d.ts.map