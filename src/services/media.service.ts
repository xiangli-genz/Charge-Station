const DEFAULT_FILE_MANAGER_API_URL = 'http://127.0.0.1:4000';

const isDataUrl = (value: string): boolean => /^data:[^;]+;base64,/.test(value);

const getFileManagerApiUrl = (): string => {
  return (process.env.FILE_MANAGER_API_URL || process.env.FILE_MANAGER_URL || DEFAULT_FILE_MANAGER_API_URL).replace(/\/+$/, '');
};

const getFileManagerPublicUrl = (): string => {
  return (
    process.env.FILE_MANAGER_PUBLIC_URL ||
    process.env.FILE_MANAGER_MEDIA_BASE_URL ||
    getFileManagerApiUrl()
  ).replace(/\/+$/, '');
};

const getFileManagerSecret = (): string => {
  return process.env.FILE_MANAGER_SECRET?.trim() || '';
};

const sanitizeFolderPath = (folderPath: string): string => {
  return folderPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
    .replace(/\.\.+/g, '')
    .replace(/\/{2,}/g, '/');
};

const getExtensionFromMimeType = (mimeType: string): string => {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes('png')) return 'png';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  if (normalized.includes('svg')) return 'svg';

  return 'bin';
};

const parseDataUrl = (value: string): { mimeType: string; buffer: Buffer } => {
  const matched = value.match(/^data:([^;]+);base64,(.+)$/);

  if (!matched) {
    throw new Error('Dinh dang tep media khong hop le');
  }

  return {
    mimeType: matched[1],
    buffer: Buffer.from(matched[2], 'base64'),
  };
};

const createFilename = (prefix: string, mimeType: string): string => {
  const safePrefix = prefix.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'media';
  return `${safePrefix}-${Date.now()}.${getExtensionFromMimeType(mimeType)}`;
};

export const normalizeMediaUrl = (value: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://') || isDataUrl(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/media/')) {
    return `${getFileManagerPublicUrl()}${normalized}`;
  }

  return normalized;
};

export const uploadBase64MediaIfNeeded = async (
  value: string,
  options: {
    folderPath: string;
    filenamePrefix: string;
  }
): Promise<string> => {
  const normalized = value.trim();

  if (!normalized) {
    return '';
  }

  if (!isDataUrl(normalized)) {
    return normalizeMediaUrl(normalized);
  }

  const fileManagerSecret = getFileManagerSecret();

  if (!fileManagerSecret) {
    return normalized;
  }

  const { mimeType, buffer } = parseDataUrl(normalized);
  const fileName = createFilename(options.filenamePrefix, mimeType);
  const folderPath = sanitizeFolderPath(options.folderPath);
  const formData = new FormData();
  formData.append('folderPath', folderPath);
  formData.append('files', new Blob([buffer], { type: mimeType }), fileName);

  const response = await fetch(`${getFileManagerApiUrl()}/file-manager/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${fileManagerSecret}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        code?: string;
        saveLinks?: Array<{ folder: string; filename: string }>;
        message?: string;
      }
    | null;

  if (!response.ok || data?.code !== 'success' || !data.saveLinks?.length) {
    throw new Error(data?.message || 'Khong the tai media len file-manager');
  }

  const uploaded = data.saveLinks[0];
  return normalizeMediaUrl(`${uploaded.folder}/${uploaded.filename}`);
};
