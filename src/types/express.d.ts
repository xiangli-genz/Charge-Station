import { Request } from 'express';

export interface AuthPayload {
  id: string;
  role: 'customer' | 'admin' | 'superadmin';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
