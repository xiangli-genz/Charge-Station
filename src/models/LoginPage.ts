import { Document, Schema, Types, model } from 'mongoose';

export interface ILoginPage extends Document {
  _id: Types.ObjectId;
  host: string;
  title: string;
  companyName: string;
  website: string;
  theme: string;
  description: string;
  logoImage: string;
  iconImage: string;
  backgroundImage: string;
  iosAppLink: string;
  androidAppLink: string;
  guideLink: string;
  servicePhone: string;
  supportPhone: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const loginPageSchema = new Schema<ILoginPage>(
  {
    host: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    title: { type: String, default: '', trim: true },
    companyName: { type: String, default: '', trim: true },
    website: { type: String, required: true, trim: true },
    theme: { type: String, required: true, trim: true, default: 'login-v1' },
    description: { type: String, default: '', trim: true },
    logoImage: { type: String, default: '' },
    iconImage: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
    iosAppLink: { type: String, default: '', trim: true },
    androidAppLink: { type: String, default: '', trim: true },
    guideLink: { type: String, default: '', trim: true },
    servicePhone: { type: String, default: '', trim: true },
    supportPhone: { type: String, default: '', trim: true },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<ILoginPage>('LoginPage', loginPageSchema);
