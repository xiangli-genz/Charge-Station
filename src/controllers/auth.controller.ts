import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import { getAdminProfile, loginAdmin, registerAdmin } from '../services/auth.service';

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const registerAdminHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fullName = normalizeText(req.body.fullName);
    const phone = normalizeText(req.body.phone);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const adminRegisterSecret =
      typeof req.body.adminRegisterSecret === 'string' ? req.body.adminRegisterSecret : '';

    if (!fullName || !phone || !email || !password || !adminRegisterSecret) {
      res.status(400).json({
        success: false,
        message: 'Vui long nhap day du thong tin admin',
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

    const result = await registerAdmin({
      fullName,
      phone,
      email,
      password,
      registerSecret: adminRegisterSecret,
    });

    res.status(201).json({
      success: true,
      message: 'Dang ky tai khoan admin thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const loginAdminHandler = async (req: Request, res: Response): Promise<void> => {
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

    const result = await loginAdmin({ email, password });

    res.status(200).json({
      success: true,
      message: 'Dang nhap admin thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAdminMeHandler = async (
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

    const user = await getAdminProfile(req.user.id);

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
