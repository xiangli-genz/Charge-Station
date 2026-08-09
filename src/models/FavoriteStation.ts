import { Document, Schema, Types, model } from 'mongoose';

export interface IFavoriteStation extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  station: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteStationSchema = new Schema<IFavoriteStation>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  },
  { timestamps: true }
);

favoriteStationSchema.index({ user: 1, station: 1 }, { unique: true });

export default model<IFavoriteStation>('FavoriteStation', favoriteStationSchema);
