import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import IdempotencyKey from '../models/IdempotencyKey';
import { AuthRequest } from '../types/express';

export const requireIdempotencyKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const key = String(req.header('Idempotency-Key') || '').trim();
  const userId = (req as AuthRequest).user?.id;
  if (!key || !userId) {
    res.status(400).json({ success: false, message: 'Thieu Idempotency-Key hoac nguoi dung' });
    return;
  }

  const route = `${req.method}:${req.baseUrl}${req.path}`;
  const bodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');
  const existing = await IdempotencyKey.findOne({ user: userId, key, route });
  if (existing) {
    if (existing.bodyHash !== bodyHash) {
      res.status(409).json({ success: false, message: 'Idempotency-Key da duoc dung cho payload khac' });
      return;
    }
    if (existing.state === 'completed' && existing.response) {
      res.status(existing.statusCode || 200).json(existing.response);
      return;
    }
    res.status(409).json({ success: false, message: 'Yeu cau voi Idempotency-Key nay dang duoc xu ly' });
    return;
  }

  try {
    await IdempotencyKey.create({ user: userId, key, route, bodyHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  } catch {
    res.status(409).json({ success: false, message: 'Yeu cau trung lap dang duoc xu ly' });
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = ((payload: Record<string, unknown>) => {
    void IdempotencyKey.updateOne({ user: userId, key, route }, { $set: { state: 'completed', statusCode: res.statusCode, response: payload } });
    return originalJson(payload);
  }) as typeof res.json;
  next();
};
