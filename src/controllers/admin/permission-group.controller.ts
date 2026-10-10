import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createPermissionGroup,
  deletePermissionGroup,
  getPermissionCatalogItems,
  listPermissionGroups,
  updatePermissionGroup,
} from '../../services/permission-group.service';
import { AuthRequest } from '../../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeCode = (value: unknown): string => {
  return normalizeText(value).toLowerCase();
};

const slugifyCode = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizePermissions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStatus = (value: unknown): 'active' | 'inactive' => {
  return value === 'inactive' ? 'inactive' : 'active';
};

const normalizeParentGroupId = (value: unknown): string | null => {
  const normalized = normalizeText(value);

  if (!normalized || normalized === '__root__') {
    return null;
  }

  return normalized;
};

export const getPermissionCatalogHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      items: await getPermissionCatalogItems(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const listPermissionGroupsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await listPermissionGroups();

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createPermissionGroupHandler = async (
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

    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code) || slugifyCode(name);
    const description = normalizeText(req.body.description);
    const permissions = normalizePermissions(req.body.permissions);
    const status = normalizeStatus(req.body.status);
    const parentGroupId = normalizeParentGroupId(req.body.parentGroupId);

    if (!name || !code) {
      res.status(400).json({
        success: false,
        message: 'Thong tin vai tro khong hop le',
      });
      return;
    }

    const item = await createPermissionGroup({
      name,
      code,
      description,
      permissions,
      parentGroupId,
      status,
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao vai tro thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updatePermissionGroupHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Nhom quyen khong hop le',
      });
      return;
    }

    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code) || slugifyCode(name);
    const description = normalizeText(req.body.description);
    const permissions = normalizePermissions(req.body.permissions);
    const status = normalizeStatus(req.body.status);
    const parentGroupId = normalizeParentGroupId(req.body.parentGroupId);

    if (!name || !code) {
      res.status(400).json({
        success: false,
        message: 'Thong tin vai tro khong hop le',
      });
      return;
    }

    const item = await updatePermissionGroup(id, {
      name,
      code,
      description,
      permissions,
      parentGroupId,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat vai tro thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deletePermissionGroupHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Vai tro khong hop le',
      });
      return;
    }

    await deletePermissionGroup(id);

    res.status(200).json({
      success: true,
      message: 'Xoa vai tro thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
