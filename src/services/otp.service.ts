import bcrypt from 'bcryptjs';
import AuthOtp, { AuthOtpPurpose } from '../models/AuthOtp';
import { sendOtpEmail } from './email.service';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const EMAIL_ONLY_MESSAGE = 'Tạm thời chỉ hỗ trợ xác thực OTP qua email';

const normalizeTarget = (target: string, channel: 'email' | 'phone'): string => {
  return channel === 'email' ? target.trim().toLowerCase() : target.trim().replace(/\s+/g, '');
};

const createCode = (): string => {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
};

export const maskOtpTarget = (target: string, channel: 'email' | 'phone'): string => {
  if (channel === 'email') {
    const [name, domain] = target.split('@');
    return `${(name || '').slice(0, 2)}***@${domain || ''}`;
  }

  const normalized = target.replace(/\s+/g, '');
  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
};

export const issueOtp = async (input: {
  userId?: string;
  target: string;
  channel: 'email' | 'phone';
  purpose: AuthOtpPurpose;
}): Promise<{ expiresAt: Date; devCode?: string }> => {
  if (input.channel !== 'email') {
    throw new Error(EMAIL_ONLY_MESSAGE);
  }

  const target = normalizeTarget(input.target, input.channel);
  const code = createCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await AuthOtp.deleteMany({
    target,
    purpose: input.purpose,
    consumedAt: null,
  });

  await AuthOtp.create({
    user: input.userId || null,
    target,
    channel: input.channel,
    purpose: input.purpose,
    codeHash,
    expiresAt,
  });

  await sendOtpEmail({
    to: target,
    code,
    purpose: input.purpose.startsWith('register') ? 'register' : 'reset_pin',
  });

  const exposeDevCode =
    process.env.NODE_ENV !== 'production' && process.env.AUTH_OTP_EXPOSE_DEV === 'true';

  return {
    expiresAt,
    ...(exposeDevCode ? { devCode: code } : {}),
  };
};

export const consumeOtp = async (input: {
  target: string;
  channel: 'email' | 'phone';
  purpose: AuthOtpPurpose;
  code: string;
  userId?: string;
}): Promise<void> => {
  if (input.channel !== 'email') {
    throw new Error(EMAIL_ONLY_MESSAGE);
  }

  const target = normalizeTarget(input.target, input.channel);
  const otp = await AuthOtp.findOne({
    target,
    channel: input.channel,
    purpose: input.purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
    ...(input.userId ? { user: input.userId } : {}),
  }).sort({ createdAt: -1 });

  if (!otp) {
    throw new Error('Ma OTP khong ton tai hoac da het han');
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('Ma OTP da bi khoa do nhap sai qua nhieu lan');
  }

  const valid = await bcrypt.compare(input.code.trim(), otp.codeHash);
  otp.attempts += 1;

  if (!valid) {
    await otp.save();
    throw new Error('Ma OTP khong dung');
  }

  otp.consumedAt = new Date();
  await otp.save();
};
