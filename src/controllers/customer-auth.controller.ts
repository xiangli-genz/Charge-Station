import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import {
  getCustomerProfile,
  loginCustomer,
  registerCustomer,
  updateCustomerProfile,
} from '../services/customer-auth.service';
import { createActivityLog } from '../services/activity-log.service';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const registerCustomerHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fullName = normalizeText(req.body.fullName);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!fullName || !phone || !email || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Thong tin dang ky nguoi dung khong hop le',
      });
      return;
    }

    const result = await registerCustomer({
      fullName,
      phone,
      email,
      password,
    });

    await createActivityLog({
      userId: result.user.id,
      action: 'customer_register',
      entityType: 'user',
      entityId: result.user.id,
      message: 'Nguoi dung da dang ky tai khoan',
    });

    res.status(201).json({
      success: true,
      message: 'Dang ky nguoi dung thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const loginCustomerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = normalizeText(req.body.identifier || req.body.email || req.body.phone);
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Thong tin dang nhap nguoi dung khong hop le',
      });
      return;
    }

    const result = await loginCustomer({ identifier, password });

    await createActivityLog({
      userId: result.user.id,
      action: 'customer_login',
      entityType: 'user',
      entityId: result.user.id,
      message: 'Nguoi dung da dang nhap',
    });

    res.status(200).json({
      success: true,
      message: 'Dang nhap nguoi dung thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getCustomerMeHandler = async (
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

    const user = await getCustomerProfile(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateCustomerProfileHandler = async (
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

    const user = await updateCustomerProfile(req.user.id, {
      fullName: req.body.fullName !== undefined ? normalizeText(req.body.fullName) : undefined,
      phone: req.body.phone !== undefined ? normalizeText(req.body.phone) : undefined,
      email: req.body.email !== undefined ? normalizeText(req.body.email).toLowerCase() : undefined,
      address: req.body.address !== undefined ? normalizeText(req.body.address) : undefined,
      description:
        req.body.description !== undefined ? normalizeText(req.body.description) : undefined,
    });

    await createActivityLog({
      userId: req.user.id,
      action: 'customer_profile_update',
      entityType: 'user',
      entityId: req.user.id,
      message: 'Nguoi dung da cap nhat ho so',
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat ho so thanh cong',
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
