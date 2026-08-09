import { Schema, model, Document, Types } from 'mongoose';

export interface IPricing extends Document {
  _id: Types.ObjectId;
  name: string;
  pricePerKwh: number;
  pricePerMinute: number;
  hourlyPrice: number;
  parkingFee: number;
  vat: number;
  description: string;
  timeRates: Array<{
    minutes: number;
    price: number;
  }>;
  timeFrames: Array<{
    name: string;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const pricingSchema = new Schema<IPricing>(
  {
    name: { type: String, required: true },
    pricePerKwh: { type: Number, required: true, min: 0 },
    pricePerMinute: { type: Number, default: 0, min: 0 },
    hourlyPrice: { type: Number, default: 0, min: 0 },
    parkingFee: { type: Number, default: 0, min: 0 },
    vat: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    timeRates: {
      type: [
        {
          minutes: { type: Number, required: true, min: 0 },
          price: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
    timeFrames: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          startTime: { type: String, required: true, trim: true },
          endTime: { type: String, required: true, trim: true },
          price: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<IPricing>('Pricing', pricingSchema);
