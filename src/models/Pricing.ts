import { Schema, model, Document, Types } from 'mongoose';

export interface IPricing extends Document {
  _id: Types.ObjectId;
  name: string;
  pricePerKwh: number;
  pricePerMinute: number;
  createdAt: Date;
  updatedAt: Date;
}

const pricingSchema = new Schema<IPricing>(
  {
    name: { type: String, required: true },
    pricePerKwh: { type: Number, required: true, min: 0 },
    pricePerMinute: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default model<IPricing>('Pricing', pricingSchema);
