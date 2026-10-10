import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createLoginPage,
  deleteLoginPage,
  listLoginPages,
  updateLoginPage,
} from '../../services/login-page.service';
import { AuthRequest } from '../../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeHost = (value: unknown): string => {
  return normalizeText(value).toLowerCase();
};

export const listLoginPagesHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await listLoginPages();

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

export const createLoginPageHandler = async (
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

    const host = normalizeHost(req.body.host);
    const website = normalizeText(req.body.website);
    const theme = normalizeText(req.body.theme);

    if (!host || !website || !theme) {
      res.status(400).json({
        success: false,
        message: 'Thong tin trang dang nhap khong hop le',
      });
      return;
    }

    const item = await createLoginPage({
      host,
      title: normalizeText(req.body.title),
      companyName: normalizeText(req.body.companyName),
      website,
      theme,
      description: normalizeText(req.body.description),
      logoImage: normalizeText(req.body.logoImage),
      iconImage: normalizeText(req.body.iconImage),
      backgroundImage: normalizeText(req.body.backgroundImage),
      iosAppLink: normalizeText(req.body.iosAppLink),
      androidAppLink: normalizeText(req.body.androidAppLink),
      guideLink: normalizeText(req.body.guideLink),
      servicePhone: normalizeText(req.body.servicePhone),
      supportPhone: normalizeText(req.body.supportPhone),
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao trang dang nhap thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateLoginPageHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Trang dang nhap khong hop le',
      });
      return;
    }

    const host = normalizeHost(req.body.host);
    const website = normalizeText(req.body.website);
    const theme = normalizeText(req.body.theme);

    if (!host || !website || !theme) {
      res.status(400).json({
        success: false,
        message: 'Thong tin trang dang nhap khong hop le',
      });
      return;
    }

    const item = await updateLoginPage(id, {
      host,
      title: normalizeText(req.body.title),
      companyName: normalizeText(req.body.companyName),
      website,
      theme,
      description: normalizeText(req.body.description),
      logoImage: normalizeText(req.body.logoImage),
      iconImage: normalizeText(req.body.iconImage),
      backgroundImage: normalizeText(req.body.backgroundImage),
      iosAppLink: normalizeText(req.body.iosAppLink),
      androidAppLink: normalizeText(req.body.androidAppLink),
      guideLink: normalizeText(req.body.guideLink),
      servicePhone: normalizeText(req.body.servicePhone),
      supportPhone: normalizeText(req.body.supportPhone),
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat trang dang nhap thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteLoginPageHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Trang dang nhap khong hop le',
      });
      return;
    }

    await deleteLoginPage(id);

    res.status(200).json({
      success: true,
      message: 'Xoa trang dang nhap thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
