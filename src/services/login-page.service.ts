import LoginPage, { ILoginPage } from '../models/LoginPage';

export interface LoginPageResponse {
  id: string;
  host: string;
  title: string;
  companyName: string;
  website: string;
  theme: string;
  description: string;
  logoImage: string;
  iconImage: string;
  backgroundImage: string;
  iosAppLink: string;
  androidAppLink: string;
  guideLink: string;
  servicePhone: string;
  supportPhone: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginPagePayload {
  host: string;
  title?: string;
  companyName?: string;
  website: string;
  theme: string;
  description?: string;
  logoImage?: string;
  iconImage?: string;
  backgroundImage?: string;
  iosAppLink?: string;
  androidAppLink?: string;
  guideLink?: string;
  servicePhone?: string;
  supportPhone?: string;
  createdById?: string | null;
}

const normalizeHost = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

const toLoginPageResponse = (item: ILoginPage): LoginPageResponse => ({
  id: item._id.toString(),
  host: item.host,
  title: item.title || '',
  companyName: item.companyName || '',
  website: item.website,
  theme: item.theme,
  description: item.description || '',
  logoImage: item.logoImage || '',
  iconImage: item.iconImage || '',
  backgroundImage: item.backgroundImage || '',
  iosAppLink: item.iosAppLink || '',
  androidAppLink: item.androidAppLink || '',
  guideLink: item.guideLink || '',
  servicePhone: item.servicePhone || '',
  supportPhone: item.supportPhone || '',
  createdById: item.createdById ?? null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const ensureUniqueHost = async (host: string, excludeId?: string): Promise<void> => {
  const existing = await LoginPage.findOne({ host });

  if (!existing) {
    return;
  }

  if (excludeId && existing._id.toString() === excludeId) {
    return;
  }

  throw new Error('Host trang dang nhap da ton tai');
};

export const listLoginPages = async (): Promise<LoginPageResponse[]> => {
  const items = await LoginPage.find().sort({ createdAt: -1, host: 1 });
  return items.map(toLoginPageResponse);
};

export const createLoginPage = async (payload: LoginPagePayload): Promise<LoginPageResponse> => {
  const host = normalizeHost(payload.host);
  await ensureUniqueHost(host);

  const item = await LoginPage.create({
    host,
    title: payload.title || '',
    companyName: payload.companyName || '',
    website: payload.website,
    theme: payload.theme,
    description: payload.description || '',
    logoImage: payload.logoImage || '',
    iconImage: payload.iconImage || '',
    backgroundImage: payload.backgroundImage || '',
    iosAppLink: payload.iosAppLink || '',
    androidAppLink: payload.androidAppLink || '',
    guideLink: payload.guideLink || '',
    servicePhone: payload.servicePhone || '',
    supportPhone: payload.supportPhone || '',
    createdById: payload.createdById ?? null,
  });

  return toLoginPageResponse(item);
};

export const updateLoginPage = async (
  loginPageId: string,
  payload: LoginPagePayload
): Promise<LoginPageResponse> => {
  const item = await LoginPage.findById(loginPageId);

  if (!item) {
    throw new Error('Trang dang nhap khong ton tai');
  }

  const host = normalizeHost(payload.host);
  await ensureUniqueHost(host, loginPageId);

  item.host = host;
  item.title = payload.title || '';
  item.companyName = payload.companyName || '';
  item.website = payload.website;
  item.theme = payload.theme;
  item.description = payload.description || '';
  item.logoImage = payload.logoImage || '';
  item.iconImage = payload.iconImage || '';
  item.backgroundImage = payload.backgroundImage || '';
  item.iosAppLink = payload.iosAppLink || '';
  item.androidAppLink = payload.androidAppLink || '';
  item.guideLink = payload.guideLink || '';
  item.servicePhone = payload.servicePhone || '';
  item.supportPhone = payload.supportPhone || '';
  await item.save();

  return toLoginPageResponse(item);
};

export const deleteLoginPage = async (loginPageId: string): Promise<void> => {
  const item = await LoginPage.findById(loginPageId);

  if (!item) {
    throw new Error('Trang dang nhap khong ton tai');
  }

  await item.deleteOne();
};

export const getLoginPageByHost = async (
  host: string
): Promise<LoginPageResponse | null> => {
  const normalizedHost = normalizeHost(host);

  const item =
    (await LoginPage.findOne({ host: normalizedHost })) ||
    (await LoginPage.findOne({ host: 'default' }).sort({ createdAt: -1 }));

  return item ? toLoginPageResponse(item) : null;
};
