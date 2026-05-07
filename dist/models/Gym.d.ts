import mongoose, { Document } from 'mongoose';
import { IGym } from '../types';
export type GymDocument = Document & IGym;
declare const _default: mongoose.Model<GymDocument, {}, {}, {}, mongoose.Document<unknown, {}, GymDocument, {}, {}> & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & IGym & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Gym.d.ts.map