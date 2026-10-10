import { Document, Schema, Types, model } from 'mongoose';

export interface IChargingConnectorType extends Document {
  _id: Types.ObjectId;
  name: string;
  shortName: string;
  chargingType: string;
  currentType: string;
  vehicleTypes: string[];
  powerMinKw: number;
  powerMaxKw: number;
  description: string;
  image: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const chargingConnectorTypeSchema = new Schema<IChargingConnectorType>(
  {
    name: { type: String, required: true, trim: true },
    shortName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    chargingType: { type: String, required: true, trim: true },
    currentType: { type: String, required: true, trim: true },
    vehicleTypes: { type: [String], default: [] },
    powerMinKw: { type: Number, default: 0, min: 0 },
    powerMaxKw: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<IChargingConnectorType>(
  'ChargingConnectorType',
  chargingConnectorTypeSchema
);
