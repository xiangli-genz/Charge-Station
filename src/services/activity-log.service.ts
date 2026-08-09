import ActivityLog, { IActivityLog } from '../models/ActivityLog';

export interface ActivityLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

const toActivityLogResponse = (item: IActivityLog): ActivityLogResponse => ({
  id: item._id.toString(),
  action: item.action,
  entityType: item.entityType || '',
  entityId: item.entityId || '',
  message: item.message || '',
  metadata: (item.metadata as Record<string, unknown> | null) ?? null,
  createdAt: item.createdAt,
});

export const createActivityLog = async (input: {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  message?: string;
  metadata?: Record<string, unknown> | null;
}): Promise<void> => {
  try {
    await ActivityLog.create({
      user: input.userId,
      action: input.action,
      entityType: input.entityType || '',
      entityId: input.entityId || '',
      message: input.message || '',
      metadata: input.metadata ?? null,
    });
  } catch {
    // Keep user flows resilient if activity logging fails.
  }
};

export const listUserActivityLogs = async (
  userId: string,
  params: { page: number; limit: number }
): Promise<{
  items: ActivityLogResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(params.limit),
    ActivityLog.countDocuments({ user: userId }),
  ]);

  return {
    items: items.map(toActivityLogResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};
