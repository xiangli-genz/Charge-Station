import { Request, Response } from 'express';
import { AuthRequest } from '../../types/express';
import {
  getCustomerProfile,
  getCustomerLoginMethods,
  loginCustomer,
  loginCustomerByPin,
  requestCustomerPinResetOtp,
  resetCustomerPinWithOtp,
  resetCustomerPinWithPassword,
  setCustomerPin,
  startCustomerRegistration,
  updateCustomerProfile,
  verifyCustomerRegistration,
} from '../../services/customer-auth.service';
import { createActivityLog } from '../../services/activity-log.service';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const getCustomerLoginMethodsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const identifier = normalizeText(req.query.identifier);
    const result = await getCustomerLoginMethods(identifier);

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

    const result = await startCustomerRegistration({
      fullName,
      phone,
      email,
      password,
      verificationChannel:
        req.body.verificationChannel === 'phone' ? 'phone' : 'email',
    });

    res.status(201).json({
      success: true,
      message: 'Da gui ma OTP xac minh dang ky',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const verifyCustomerRegistrationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = normalizeText(req.body.userId);
    const channel = req.body.channel === 'phone' ? 'phone' : 'email';
    const code = normalizeText(req.body.code);

    if (!userId || !code) {
      res.status(400).json({
        success: false,
        message: 'Thieu thong tin xac minh OTP',
      });
      return;
    }

    const result = await verifyCustomerRegistration({ userId, channel, code });

    await createActivityLog({
      userId: result.user.id,
      action: 'customer_register',
      entityType: 'user',
      entityId: result.user.id,
      message: 'Nguoi dung da xac minh tai khoan va dang ky thanh cong',
    });

    res.status(200).json({
      success: true,
      message: 'Xac minh dang ky thanh cong',
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

export const loginCustomerByPinHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const identifier = normalizeText(req.body.identifier || req.body.email || req.body.phone);
    const pin = normalizeText(req.body.pin);

    if (!identifier || !pin) {
      res.status(400).json({
        success: false,
        message: 'Thieu so dien thoai/email hoac ma PIN',
      });
      return;
    }

    const result = await loginCustomerByPin({ identifier, pin });

    await createActivityLog({
      userId: result.user.id,
      action: 'customer_pin_login',
      entityType: 'user',
      entityId: result.user.id,
      message: 'Nguoi dung da dang nhap bang ma PIN',
    });

    res.status(200).json({
      success: true,
      message: 'Dang nhap bang PIN thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const setCustomerPinHandler = async (
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

    const pin = normalizeText(req.body.pin);
    const user = await setCustomerPin(req.user.id, pin);

    res.status(200).json({
      success: true,
      message: 'Thiet lap ma PIN thanh cong',
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const resetCustomerPinWithPasswordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const identifier = normalizeText(req.body.identifier);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const pin = normalizeText(req.body.pin);

    const result = await resetCustomerPinWithPassword({ identifier, password, pin });

    res.status(200).json({
      success: true,
      message: 'Dat lai ma PIN thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const requestCustomerPinResetOtpHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const identifier = normalizeText(req.body.identifier);
    const channel = req.body.channel === 'phone' ? 'phone' : 'email';

    const result = await requestCustomerPinResetOtp({ identifier, channel });

    res.status(200).json({
      success: true,
      message: 'Đã gửi OTP qua email',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const resetCustomerPinWithOtpHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const identifier = normalizeText(req.body.identifier);
    const channel = req.body.channel === 'phone' ? 'phone' : 'email';
    const code = normalizeText(req.body.code);
    const pin = normalizeText(req.body.pin);

    const result = await resetCustomerPinWithOtp({
      identifier,
      channel,
      code,
      pin,
    });

    res.status(200).json({
      success: true,
      message: 'Dat lai ma PIN bang OTP thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
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
      vehicleType:
        req.body.vehicleType !== undefined ? normalizeText(req.body.vehicleType) as 'motorbike' | 'car' | 'truck' | 'other' : undefined,
      vehicleName:
        req.body.vehicleName !== undefined ? normalizeText(req.body.vehicleName) : undefined,
      vehicleImageUrl:
        req.body.vehicleImageUrl !== undefined
          ? normalizeText(req.body.vehicleImageUrl)
          : undefined,
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
