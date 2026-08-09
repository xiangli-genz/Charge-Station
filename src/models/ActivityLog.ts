import { Document, Schema, Types, model } from 'mongoose';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, default: '', trim: true },
    entityId: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

export default model<IActivityLog>('ActivityLog', activityLogSchema);
