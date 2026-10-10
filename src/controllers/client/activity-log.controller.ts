import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import { listUserActivityLogs } from '../../services/activity-log.service';

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
};

export const listActivityLogsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const result = await listUserActivityLogs(req.user.id, {
      page: parsePositiveInteger(req.query.page, 1),
      limit: Math.min(parsePositiveInteger(req.query.limit, 20), 50),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
