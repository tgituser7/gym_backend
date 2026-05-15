import { Schema, model, Document } from 'mongoose';

export interface ChatInquiryDocument extends Document {
  name: string;
  mobile: string;
  email?: string;
  gymName: string;
  city?: string;
  message: string;
}

const chatInquirySchema = new Schema<ChatInquiryDocument>(
  {
    name:    { type: String, required: true, trim: true },
    mobile:  { type: String, required: true, trim: true },
    email:   { type: String, trim: true, lowercase: true },
    gymName: { type: String, required: true, trim: true },
    city:    { type: String, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default model<ChatInquiryDocument>('ChatInquiry', chatInquirySchema);
