import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createPermission,
  deletePermission,
  getPermissionCatalog,
  getPermissionGroupOptions,
  listPermissions,
  updatePermission,
} from '../services/permission.service';
import { AuthRequest } from '../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeStatus = (value: unknown): 'active' | 'inactive' => {
  return value === 'inactive' ? 'inactive' : 'active';
};

const normalizeGroupKey = (value: unknown): string => {
  return normalizeText(value).toLowerCase();
};

const buildGroupName = async (groupKey: string, fallback: string): Promise<string> => {
  const groups = await getPermissionGroupOptions();
  const matched = groups.find((item) => item.key === groupKey);
  return matched?.name || fallback || groupKey;
};

export const listPermissionsHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await listPermissions();

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

export const getPermissionCatalogHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      items: await getPermissionCatalog(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getPermissionGroupOptionsHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      items: await getPermissionGroupOptions(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createPermissionHandler = async (
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
    const groupKey = normalizeGroupKey(req.body.groupKey || req.body.group);
    const description = normalizeText(req.body.description);
    const status = normalizeStatus(req.body.status);

    if (!name || !groupKey) {
      res.status(400).json({
        success: false,
        message: 'Thong tin quyen khong hop le',
      });
      return;
    }

    const item = await createPermission({
      name,
      groupKey,
      groupName: await buildGroupName(groupKey, normalizeText(req.body.groupName)),
      description,
      status,
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao quyen thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updatePermissionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Quyen khong hop le',
      });
      return;
    }

    const name = normalizeText(req.body.name);
    const groupKey = normalizeGroupKey(req.body.groupKey || req.body.group);
    const description = normalizeText(req.body.description);
    const status = normalizeStatus(req.body.status);

    if (!name || !groupKey) {
      res.status(400).json({
        success: false,
        message: 'Thong tin quyen khong hop le',
      });
      return;
    }

    const item = await updatePermission(id, {
      name,
      groupKey,
      groupName: await buildGroupName(groupKey, normalizeText(req.body.groupName)),
      description,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat quyen thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deletePermissionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Quyen khong hop le',
      });
      return;
    }

    await deletePermission(id);

    res.status(200).json({
      success: true,
      message: 'Xoa quyen thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
