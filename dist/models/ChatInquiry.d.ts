import { Document } from 'mongoose';
export interface ChatInquiryDocument extends Document {
    name: string;
    mobile: string;
    email?: string;
    gymName: string;
    city?: string;
    message: string;
}
declare const _default: import("mongoose").Model<ChatInquiryDocument, {}, {}, {}, Document<unknown, {}, ChatInquiryDocument, {}, {}> & ChatInquiryDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ChatInquiry.d.ts.map