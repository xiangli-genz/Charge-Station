import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

export type StaffRole = 'admin' | 'superadmin';

interface RegisterStaffInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  registerSecret: string;
  role: StaffRole;
}

interface LoginStaffInput {
  email: string;
  password: string;
  allowedRoles: StaffRole[];
}

interface StaffUserResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: StaffRole;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffAuthResponse {
  token: string;
  user: StaffUserResponse;
}

export interface CreateStaffInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: StaffRole;
}

const SALT_ROUNDS = 10;
const ENV_SUPERADMIN_ID = 'env-superadmin';

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

interface ConfiguredSuperAdmin {
  email: string;
  password: string;
}

const getConfiguredSuperAdmin = (): ConfiguredSuperAdmin | null => {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
};

const getRegisterSecret = (): string => {
  const secret = process.env.ADMIN_REGISTER_SECRET;

  if (!secret) {
    throw new Error('ADMIN_REGISTER_SECRET chua duoc cau hinh');
  }

  return secret;
};

const toStaffUserResponse = (user: IUser): StaffUserResponse => ({
  id: user._id.toString(),
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: user.role as StaffRole,
  walletBalance: user.walletBalance,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const toConfiguredSuperAdminResponse = (): StaffUserResponse => {
  const configuredSuperAdmin = getConfiguredSuperAdmin();

  if (!configuredSuperAdmin) {
    throw new Error('SUPERADMIN_EMAIL va SUPERADMIN_PASSWORD chua duoc cau hinh');
  }

  const now = new Date();

  return {
    id: ENV_SUPERADMIN_ID,
    fullName: 'Superadmin',
    phone: 'system',
    email: configuredSuperAdmin.email,
    role: 'superadmin',
    walletBalance: 0,
    createdAt: now,
    updatedAt: now,
  };
};

const signStaffToken = (id: string, role: StaffRole): string => {
  return jwt.sign(
    {
      id,
      role,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    }
  );
};

const validateStaffUser = (
  user: IUser | null,
  allowedRoles: StaffRole[] = ['admin', 'superadmin']
): IUser => {
  if (!user || !allowedRoles.includes(user.role as StaffRole)) {
    throw new Error('Tai khoan khong ton tai');
  }

  return user;
};

const createStaffUser = async (input: RegisterStaffInput): Promise<StaffAuthResponse> => {
  const expectedSecret = getRegisterSecret();

  if (input.registerSecret !== expectedSecret) {
    throw new Error('Ma xac thuc khong hop le');
  }

  const existingUser = await User.findOne({
    $or: [{ email: input.email }, { phone: input.phone }],
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new Error('Email da ton tai');
    }

    throw new Error('So dien thoai da ton tai');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return {
    token: signStaffToken(user._id.toString(), user.role as StaffRole),
    user: toStaffUserResponse(user),
  };
};

const loginStaff = async (input: LoginStaffInput): Promise<StaffAuthResponse> => {
  const user = validateStaffUser(await User.findOne({ email: input.email }), input.allowedRoles);
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Mat khau khong dung');
  }

  return {
    token: signStaffToken(user._id.toString(), user.role as StaffRole),
    user: toStaffUserResponse(user),
  };
};

const loginConfiguredSuperAdmin = (input: {
  email: string;
  password: string;
}): StaffAuthResponse => {
  const configuredSuperAdmin = getConfiguredSuperAdmin();

  if (!configuredSuperAdmin) {
    throw new Error('SUPERADMIN_EMAIL va SUPERADMIN_PASSWORD chua duoc cau hinh');
  }

  if (
    input.email !== configuredSuperAdmin.email ||
    input.password !== configuredSuperAdmin.password
  ) {
    throw new Error('Email hoac mat khau khong dung');
  }

  return {
    token: signStaffToken(ENV_SUPERADMIN_ID, 'superadmin'),
    user: toConfiguredSuperAdminResponse(),
  };
};

export const registerAdmin = async (input: Omit<RegisterStaffInput, 'role'>): Promise<StaffAuthResponse> => {
  return createStaffUser({ ...input, role: 'admin' });
};

export const loginAdmin = async (
  input: Omit<LoginStaffInput, 'allowedRoles'>
): Promise<StaffAuthResponse> => {
  const configuredSuperAdmin = getConfiguredSuperAdmin();

  if (
    configuredSuperAdmin &&
    input.email === configuredSuperAdmin.email &&
    input.password === configuredSuperAdmin.password
  ) {
    return loginConfiguredSuperAdmin(input);
  }

  return loginStaff({ ...input, allowedRoles: ['admin'] });
};

export const loginSuperAdmin = async (
  input: Omit<LoginStaffInput, 'allowedRoles'>
): Promise<StaffAuthResponse> => {
  return loginConfiguredSuperAdmin(input);
};

export const getAdminProfile = async (userId: string): Promise<StaffUserResponse> => {
  if (userId === ENV_SUPERADMIN_ID) {
    return toConfiguredSuperAdminResponse();
  }

  const user = validateStaffUser(await User.findById(userId), ['admin']);
  return toStaffUserResponse(user);
};

export const getSuperAdminProfile = async (userId: string): Promise<StaffUserResponse> => {
  if (userId === ENV_SUPERADMIN_ID) {
    return toConfiguredSuperAdminResponse();
  }

  const user = validateStaffUser(await User.findById(userId), ['superadmin']);
  return toStaffUserResponse(user);
};

export const listStaffUsers = async (): Promise<StaffUserResponse[]> => {
  const users = await User.find({ role: { $in: ['admin', 'superadmin'] as UserRole[] } }).sort({
    createdAt: -1,
  });

  const configuredSuperAdmin = getConfiguredSuperAdmin()
    ? [toConfiguredSuperAdminResponse()]
    : [];

  return [...configuredSuperAdmin, ...users.map(toStaffUserResponse)];
};

export const createStaffBySuperAdmin = async (
  input: CreateStaffInput
): Promise<StaffUserResponse> => {
  const configuredSuperAdmin = getConfiguredSuperAdmin();

  if (configuredSuperAdmin && input.email === configuredSuperAdmin.email) {
    throw new Error('Email da duoc danh cho tai khoan superadmin he thong');
  }

  const existingUser = await User.findOne({
    $or: [{ email: input.email }, { phone: input.phone }],
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new Error('Email da ton tai');
    }

    throw new Error('So dien thoai da ton tai');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return toStaffUserResponse(user);
};

export const updateStaffRoleBySuperAdmin = async (
  userId: string,
  role: StaffRole,
  actorUserId?: string
): Promise<StaffUserResponse> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Tai khoan khong ton tai');
  }

  if (user.role === 'customer') {
    throw new Error('Chi co the cap nhat tai khoan staff');
  }

  if (actorUserId && userId === actorUserId && role !== 'superadmin') {
    throw new Error('Khong the tu ha role cua chinh minh');
  }

  if (user.role === 'superadmin' && role === 'admin') {
    const superadminCount = await User.countDocuments({ role: 'superadmin' });
    const configuredSuperAdminCount = getConfiguredSuperAdmin() ? 1 : 0;

    if (superadminCount + configuredSuperAdminCount <= 1) {
      throw new Error('He thong phai co it nhat mot superadmin');
    }
  }

  user.role = role;
  await user.save();

  return toStaffUserResponse(user);
};
