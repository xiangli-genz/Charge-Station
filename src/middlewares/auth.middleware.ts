import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload, AuthRequest } from '../types/express';

const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET chua duoc cau hinh');
  }

  return jwtSecret;
};

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Thieu token xac thuc',
      });
      return;
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token khong hop le hoac da het han',
      error: (error as Error).message,
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Chua xac thuc nguoi dung',
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      message: 'Ban khong co quyen truy cap tai nguyen nay',
    });
    return;
  }

  next();
};

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Chua xac thuc nguoi dung',
    });
    return;
  }

  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Chi tai khoan quan tri moi co quyen truy cap',
    });
    return;
  }

  next();
};
