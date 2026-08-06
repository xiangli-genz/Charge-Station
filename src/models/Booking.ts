import { Schema, model, Document, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ chargingPoint: 1, startTime: 1, endTime: 1, status: 1 });
bookingSchema.index({ user: 1, startTime: -1 });

export default model<IBooking>('Booking', bookingSchema);
