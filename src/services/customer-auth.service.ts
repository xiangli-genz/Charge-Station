import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface CustomerProfileResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'customer';
  address: string;
  description: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAuthResponse {
  token: string;
  user: CustomerProfileResponse;
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
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const ensureCustomer = (user: IUser | null): IUser => {
  if (!user || user.role !== 'customer') {
    throw new Error('Tai khoan nguoi dung khong ton tai');
  }

  return user;
};

export const registerCustomer = async (input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<CustomerAuthResponse> => {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const fullName = input.fullName.trim();
  const [userByEmail, userByPhone] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ phone }),
  ]);

  if (userByEmail && userByPhone && userByEmail._id.toString() !== userByPhone._id.toString()) {
    throw new Error('Email va so dien thoai dang thuoc ve hai tai khoan khac nhau');
  }

  const existingUser = userByEmail || userByPhone;
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  if (existingUser) {
    if (existingUser.role !== 'customer') {
      throw new Error('Thong tin nay dang duoc su dung boi tai khoan staff');
    }

    existingUser.fullName = fullName;
    existingUser.email = email;
    existingUser.phone = phone;
    existingUser.passwordHash = passwordHash;
    await existingUser.save();

    return {
      token: signCustomerToken(existingUser._id.toString()),
      user: toCustomerProfile(existingUser),
    };
  }

  const user = await User.create({
    fullName,
    phone,
    email,
    passwordHash,
    role: 'customer',
  });

  return {
    token: signCustomerToken(user._id.toString()),
    user: toCustomerProfile(user),
  };
};

export const loginCustomer = async (input: {
  identifier: string;
  password: string;
}): Promise<CustomerAuthResponse> => {
  const identifier = input.identifier.trim().toLowerCase();
  const user = ensureCustomer(
    await User.findOne({
      $or: [{ email: identifier }, { phone: input.identifier.trim() }],
    })
  );
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Mat khau khong dung');
  }

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

  await user.save();
  return toCustomerProfile(user);
};
