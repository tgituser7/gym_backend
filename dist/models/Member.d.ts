import mongoose, { Document } from 'mongoose';
import { IMember } from '../types';
export type MemberDocument = Document & IMember;
declare const _default: mongoose.Model<MemberDocument, {}, {}, {}, mongoose.Document<unknown, {}, MemberDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IMember & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Member.d.ts.map