import mongoose, { Document } from 'mongoose';
import { IService } from '../types';
export type ServiceDocument = Document & IService;
declare const _default: mongoose.Model<ServiceDocument, {}, {}, {}, mongoose.Document<unknown, {}, ServiceDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IService & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Service.d.ts.map