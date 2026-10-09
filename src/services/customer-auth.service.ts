import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser, VehicleType } from '../models/User';
import { consumeOtp, issueOtp, maskOtpTarget } from './otp.service';

export interface CustomerProfileResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'customer';
  address: string;
  description: string;
  walletBalance: number;
  pinEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAuthResponse {
  token: string;
  user: CustomerProfileResponse;
}

export interface CustomerRegistrationResponse {
  userId: string;
  channel: 'email';
  target: string;
  expiresAt: Date;
  devCode?: string;
}

const SALT_ROUNDS = 10;

const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET chua duoc cau hinh');
  }

  return jwtSecret;
};

const getJwtExpiresIn = (): SignOptions['expiresIn'] => {
  return (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
};

const signCustomerToken = (id: string): string => {
  return jwt.sign(
    {
      id,
      role: 'customer',
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    }
  );
};

const toCustomerProfile = (user: IUser): CustomerProfileResponse => ({
  id: user._id.toString(),
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: 'customer',
  address: user.address || '',
  description: user.description || '',
  walletBalance: user.walletBalance || 0,
  pinEnabled: Boolean(user.pinEnabled && user.pinHash),
  emailVerified: Boolean(user.emailVerifiedAt),
  phoneVerified: Boolean(user.phoneVerifiedAt),
  vehicleType: user.vehicleType || 'motorbike',
  vehicleName: user.vehicleName || '',
  vehicleImageUrl: user.vehicleImageUrl || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const ensureCustomer = (user: IUser | null): IUser => {
  if (!user || user.role !== 'customer') {
    throw new Error('Tai khoan nguoi dung khong ton tai');
  }

  return user;
};

const ensureRegistrationVerified = (user: IUser): void => {
  if (user.registrationVerified === false) {
    throw new Error('Tai khoan chua duoc xac minh OTP');
  }
};

const normalizeChannel = (channel: unknown): 'email' => {
  if (channel === 'phone') {
    throw new Error('Tạm thời chỉ hỗ trợ xác thực OTP qua email');
  }

  return 'email';
};

const validatePin = (pin: string): void => {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('Ma PIN phai gom 6 chu so');
  }
};

const vehicleTypes: VehicleType[] = ['motorbike', 'car', 'truck', 'other'];

const normalizeVehicleType = (value: unknown): VehicleType => {
  if (typeof value !== 'string' || !vehicleTypes.includes(value as VehicleType)) {
    throw new Error('Loại phương tiện không hợp lệ');
  }

  return value as VehicleType;
};

const findCustomerByIdentifier = async (identifier: string): Promise<IUser> => {
  const normalized = identifier.trim();
  const email = normalized.toLowerCase();
  const user = await User.findOne({
    $or: [{ email }, { phone: normalized }],
  });

  return ensureCustomer(user);
};

export const startCustomerRegistration = async (input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  verificationChannel?: 'email' | 'phone';
}): Promise<CustomerRegistrationResponse> => {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const fullName = input.fullName.trim();
  const [userByEmail, userByPhone] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ phone }),
  ]);

  if (userByEmail && userByPhone) {
    if (userByEmail._id.toString() !== userByPhone._id.toString()) {
      throw new Error('Email va so dien thoai deu da ton tai tren tai khoan khac nhau');
    }

    throw new Error('Email va so dien thoai da ton tai');
  }

  if (userByEmail) {
    throw new Error('Email da ton tai');
  }

  if (userByPhone) {
    throw new Error('So dien thoai da ton tai');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    fullName,
    phone,
    email,
    passwordHash,
    role: 'customer',
    registrationVerified: false,
  });

  return {
    ...(await (async () => {
      const channel = normalizeChannel(input.verificationChannel);
      const target = user.email;
      const otp = await issueOtp({
        userId: user._id.toString(),
        target,
        channel,
        purpose: 'register_email',
      });

      return {
        userId: user._id.toString(),
        channel,
        target: maskOtpTarget(target, channel),
        expiresAt: otp.expiresAt,
        ...(otp.devCode ? { devCode: otp.devCode } : {}),
      };
    })()),
  };
};

export const verifyCustomerRegistration = async (input: {
  userId: string;
  channel: 'email' | 'phone';
  code: string;
}): Promise<CustomerAuthResponse> => {
  const user = ensureCustomer(await User.findById(input.userId));
  const channel = normalizeChannel(input.channel);
  const target = user.email;

  await consumeOtp({
    userId: user._id.toString(),
    target,
    channel,
    purpose: 'register_email',
    code: input.code,
  });

  user.emailVerifiedAt = new Date();
  user.registrationVerified = true;
  await user.save();

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const loginCustomer = async (input: {
  identifier: string;
  password: string;
}): Promise<CustomerAuthResponse> => {
  const user = await findCustomerByIdentifier(input.identifier);
  ensureRegistrationVerified(user);
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Mat khau khong dung');
  }

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const loginCustomerByPin = async (input: {
  identifier: string;
  pin: string;
}): Promise<CustomerAuthResponse> => {
  validatePin(input.pin);
  const user = await findCustomerByIdentifier(input.identifier);
  ensureRegistrationVerified(user);

  if (!user.pinHash || !user.pinEnabled) {
    throw new Error('Tai khoan chua thiet lap ma PIN');
  }

  const isPinValid = await bcrypt.compare(input.pin, user.pinHash);

  if (!isPinValid) {
    throw new Error('Ma PIN khong dung');
  }

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const getCustomerLoginMethods = async (identifier: string): Promise<{
  pinEnabled: boolean;
  user?: { fullName: string };
}> => {
  const normalized = identifier.trim();

  if (!normalized) {
    throw new Error('Thieu email hoac so dien thoai');
  }

  const user = await User.findOne({
    $or: [{ email: normalized.toLowerCase() }, { phone: normalized }],
  });

  if (!user || user.role !== 'customer') {
    return { pinEnabled: false };
  }

  if (user.registrationVerified === false) {
    return { pinEnabled: false };
  }

  return {
    pinEnabled: Boolean(user.pinEnabled && user.pinHash),
    user: { fullName: user.fullName },
  };
};

export const setCustomerPin = async (userId: string, pin: string): Promise<CustomerProfileResponse> => {
  validatePin(pin);
  const user = ensureCustomer(await User.findById(userId));

  user.pinHash = await bcrypt.hash(pin, 10);
  user.pinEnabled = true;
  await user.save();

  return toCustomerProfile(user);
};

export const resetCustomerPinWithPassword = async (input: {
  identifier: string;
  password: string;
  pin: string;
}): Promise<CustomerAuthResponse> => {
  const user = await findCustomerByIdentifier(input.identifier);
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Mat khau khong dung');
  }

  await setCustomerPin(user._id.toString(), input.pin);

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const requestCustomerPinResetOtp = async (input: {
  identifier: string;
  channel?: 'email' | 'phone';
}): Promise<{ channel: 'email'; target: string; expiresAt: Date; devCode?: string }> => {
  const user = await findCustomerByIdentifier(input.identifier);
  const channel = normalizeChannel(input.channel);
  const target = user.email;
  const otp = await issueOtp({
    userId: user._id.toString(),
    target,
    channel,
    purpose: 'reset_pin_email',
  });

  return {
    channel,
    target: maskOtpTarget(target, channel),
    expiresAt: otp.expiresAt,
    ...(otp.devCode ? { devCode: otp.devCode } : {}),
  };
};

export const resetCustomerPinWithOtp = async (input: {
  identifier: string;
  channel: 'email' | 'phone';
  code: string;
  pin: string;
}): Promise<CustomerAuthResponse> => {
  const user = await findCustomerByIdentifier(input.identifier);
  const channel = normalizeChannel(input.channel);
  const target = user.email;

  await consumeOtp({
    userId: user._id.toString(),
    target,
    channel,
    purpose: 'reset_pin_email',
    code: input.code,
  });

  await setCustomerPin(user._id.toString(), input.pin);

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const getCustomerProfile = async (userId: string): Promise<CustomerProfileResponse> => {
  return toCustomerProfile(ensureCustomer(await User.findById(userId)));
};

export const updateCustomerProfile = async (
  userId: string,
  input: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    description?: string;
    vehicleType?: VehicleType;
    vehicleName?: string;
    vehicleImageUrl?: string;
  }
): Promise<CustomerProfileResponse> => {
  const user = ensureCustomer(await User.findById(userId));
  const nextEmail = input.email?.trim().toLowerCase();
  const nextPhone = input.phone?.trim();

  if (nextEmail && nextEmail !== user.email) {
    const existingByEmail = await User.findOne({ email: nextEmail });

    if (existingByEmail && existingByEmail._id.toString() !== userId) {
      throw new Error('Email da ton tai');
    }

    user.email = nextEmail;
  }

  if (nextPhone && nextPhone !== user.phone) {
    const existingByPhone = await User.findOne({ phone: nextPhone });

    if (existingByPhone && existingByPhone._id.toString() !== userId) {
      throw new Error('So dien thoai da ton tai');
    }

    user.phone = nextPhone;
  }

  if (input.fullName !== undefined) {
    user.fullName = input.fullName.trim() || user.fullName;
  }

  if (input.address !== undefined) {
    user.address = input.address.trim();
  }

  if (input.description !== undefined) {
    user.description = input.description.trim();
  }

  if (input.vehicleType !== undefined) {
    user.vehicleType = normalizeVehicleType(input.vehicleType);
  }

  if (input.vehicleName !== undefined) {
    user.vehicleName = input.vehicleName.trim();
  }

  if (input.vehicleImageUrl !== undefined) {
    user.vehicleImageUrl = input.vehicleImageUrl.trim();
  }

  await user.save();
  return toCustomerProfile(user);
};
