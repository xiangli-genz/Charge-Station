import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createManagedChildUser,
  deleteManagedChildUser,
  getManagedUserTree,
  resetManagedChildPassword,
  updateManagedChildUser,
} from '../../services/admin-user-tree.service';
import { AuthRequest } from '../../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const buildFallbackEmail = (username: string, fullName: string): string => {
  const base = (username || fullName || 'user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${base || 'user'}@tramsac.local`;
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const isManagedUserStatus = (value: unknown): value is 'active' | 'inactive' => {
  return value === 'active' || value === 'inactive';
};

const parseWalletBalance = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listManagedUsersHandler = async (
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

    const result = await getManagedUserTree(req.user.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createManagedUserHandler = async (
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

    const fullName = normalizeText(req.body.fullName);
    const username = normalizeText(req.body.username);
    const phone = normalizeText(req.body.phone);
    const email = (
      normalizeText(req.body.email).toLowerCase() || buildFallbackEmail(username, fullName)
    ).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const walletBalance = parseWalletBalance(req.body.walletBalance) ?? 0;
    const parentId = normalizeText(req.body.parentId) || undefined;
    const status = isManagedUserStatus(req.body.status) ? req.body.status : 'active';
    const userType = normalizeText(req.body.userType) || 'Nguoi dung';
    const description = normalizeText(req.body.description);
    const address = normalizeText(req.body.address);
    const landingPage = normalizeText(req.body.landingPage) || 'map';
    const permissionGroupId = normalizeText(req.body.permissionGroupId) || null;

    if (!fullName || !phone || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Thong tin tai khoan con khong hop le',
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

    if (parentId && parentId !== req.user.id && !isValidObjectId(parentId)) {
      res.status(400).json({
        success: false,
        message: 'Tai khoan cha khong hop le',
      });
      return;
    }

    if (permissionGroupId && !isValidObjectId(permissionGroupId)) {
      res.status(400).json({
        success: false,
        message: 'Nhom quyen khong hop le',
      });
      return;
    }

    const item = await createManagedChildUser(req.user.id, {
      username: username || undefined,
      fullName,
      phone,
      email,
      password,
      walletBalance,
      parentId,
      status,
      userType,
      description,
      address,
      landingPage,
      permissionGroupId,
    });

    res.status(201).json({
      success: true,
      message: 'Tao tai khoan con thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateManagedUserHandler = async (
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

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'User id khong hop le',
      });
      return;
    }

    const fullName = normalizeText(req.body.fullName);
    const username = normalizeText(req.body.username);
    const phone = normalizeText(req.body.phone);
    const email =
      normalizeText(req.body.email).toLowerCase() ||
      (username || fullName ? buildFallbackEmail(username, fullName) : '');
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const walletBalance = parseWalletBalance(req.body.walletBalance);
    const parentId = normalizeText(req.body.parentId);
    const status = isManagedUserStatus(req.body.status) ? req.body.status : undefined;
    const userType = normalizeText(req.body.userType);
    const description = normalizeText(req.body.description);
    const address = normalizeText(req.body.address);
    const landingPage = normalizeText(req.body.landingPage);
    const permissionGroupId =
      req.body.permissionGroupId === null ? null : normalizeText(req.body.permissionGroupId);

    if (email && !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Email khong hop le',
      });
      return;
    }

    if (password && !isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message: 'Mat khau phai co it nhat 6 ky tu',
      });
      return;
    }

    if (parentId && parentId !== req.user.id && !isValidObjectId(parentId)) {
      res.status(400).json({
        success: false,
        message: 'Tai khoan cha khong hop le',
      });
      return;
    }

    if (permissionGroupId && !isValidObjectId(permissionGroupId)) {
      res.status(400).json({
        success: false,
        message: 'Nhom quyen khong hop le',
      });
      return;
    }

    const item = await updateManagedChildUser(req.user.id, id, {
      username: username || undefined,
      fullName: fullName || undefined,
      phone: phone || undefined,
      email: email || undefined,
      password: password || undefined,
      walletBalance,
      parentId: parentId || undefined,
      status,
      userType: userType || undefined,
      description: req.body.description !== undefined ? description : undefined,
      address: req.body.address !== undefined ? address : undefined,
      landingPage: landingPage || undefined,
      permissionGroupId,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat tai khoan con thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const resetManagedUserPasswordHandler = async (
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

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'User id khong hop le',
      });
      return;
    }

    const result = await resetManagedChildPassword(req.user.id, id);

    res.status(200).json({
      success: true,
      message: 'Dat lai mat khau thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteManagedUserHandler = async (
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

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'User id khong hop le',
      });
      return;
    }

    await deleteManagedChildUser(req.user.id, id);

    res.status(200).json({
      success: true,
      message: 'Xoa tai khoan con thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
