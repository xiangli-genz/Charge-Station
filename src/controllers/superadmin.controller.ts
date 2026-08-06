import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import {
  createStaffBySuperAdmin,
  getSuperAdminProfile,
  listStaffUsers,
  loginSuperAdmin,
  updateStaffRoleBySuperAdmin,
} from '../services/auth.service';

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const isStaffRole = (value: unknown): value is 'admin' | 'superadmin' => {
  return value === 'admin' || value === 'superadmin';
};

export const loginSuperAdminHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email va mat khau la bat buoc',
      });
      return;
    }

    const result = await loginSuperAdmin({ email, password });

    res.status(200).json({
      success: true,
      message: 'Dang nhap superadmin thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getSuperAdminMeHandler = async (
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

    const user = await getSuperAdminProfile(req.user.id);

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

export const listSuperAdminStaffHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await listStaffUsers();

    res.status(200).json({
      success: true,
      items: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createStaffHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fullName = normalizeText(req.body.fullName);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = isStaffRole(req.body.role) ? req.body.role : undefined;

    if (!fullName || !phone || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Thong tin staff khong hop le',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Email khong hop le',
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message: 'Mat khau phai co it nhat 6 ky tu',
      });
      return;
    }

    const user = await createStaffBySuperAdmin({
      fullName,
      phone,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'Tao tai khoan staff thanh cong',
      item: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateStaffRoleHandler = async (
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

    const { id } = req.params;
    const role = isStaffRole(req.body.role) ? req.body.role : undefined;

    if (!role) {
      res.status(400).json({
        success: false,
        message: 'Role khong hop le',
      });
      return;
    }

    const user = await updateStaffRoleBySuperAdmin(id, role, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cap nhat role staff thanh cong',
      item: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
