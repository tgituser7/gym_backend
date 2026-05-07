import mongoose, { Document } from 'mongoose';
import { IBranch } from '../types';
export type BranchDocument = Document & IBranch;
declare const _default: mongoose.Model<BranchDocument, {}, {}, {}, mongoose.Document<unknown, {}, BranchDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IBranch & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Branch.d.ts.map