import { Document, Schema, Types, model } from 'mongoose';

export interface ISimType extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const simTypeSchema = new Schema<ISimType>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    description: { type: String, default: '', trim: true },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<ISimType>('SimType', simTypeSchema);
