export type ImportFormat = 'csv' | 'json';
export type ImportMode = 'insert' | 'upsert';

export interface ParsedImportPayload {
  format: ImportFormat;
  mode: ImportMode;
  rows: Record<string, unknown>[];
}

export interface ImportResult<T> {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  items: T[];
}

const splitCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

export const parseCsvContent = (content: string): Record<string, string>[] => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
};

export const parseImportPayload = (payload: {
  format?: unknown;
  mode?: unknown;
  content?: unknown;
  items?: unknown;
}): ParsedImportPayload => {
  const format = payload.format === 'json' ? 'json' : 'csv';
  const mode = payload.mode === 'insert' ? 'insert' : 'upsert';

  if (format === 'json') {
    if (Array.isArray(payload.items)) {
      return {
        format,
        mode,
        rows: payload.items.filter(
          (item): item is Record<string, unknown> => typeof item === 'object' && item !== null
        ),
      };
    }

    if (typeof payload.content === 'string' && payload.content.trim()) {
      const parsed = JSON.parse(payload.content) as unknown;

      if (!Array.isArray(parsed)) {
        throw new Error('Noi dung JSON phai la mot mang doi tuong');
      }

      return {
        format,
        mode,
        rows: parsed.filter(
          (item): item is Record<string, unknown> => typeof item === 'object' && item !== null
        ),
      };
    }

    throw new Error('Payload JSON can co items hoac content hop le');
  }

  if (typeof payload.content !== 'string' || !payload.content.trim()) {
    throw new Error('Payload CSV can truong content chua du lieu CSV');
  }

  return {
    format,
    mode,
    rows: parseCsvContent(payload.content),
  };
};

export const parseNumberField = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseStringField = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const parseStringArrayField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};
