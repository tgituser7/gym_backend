import mongoose, { Document } from 'mongoose';
import { IStaff } from '../types';
export type StaffDocument = Document & IStaff;
declare const _default: mongoose.Model<StaffDocument, {}, {}, {}, mongoose.Document<unknown, {}, StaffDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IStaff & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Staff.d.ts.map