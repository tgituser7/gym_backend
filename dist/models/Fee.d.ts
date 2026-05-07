import mongoose, { Document } from 'mongoose';
import { IFee } from '../types';
export type FeeDocument = Document & IFee;
declare const _default: mongoose.Model<FeeDocument, {}, {}, {}, mongoose.Document<unknown, {}, FeeDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IFee & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Fee.d.ts.map