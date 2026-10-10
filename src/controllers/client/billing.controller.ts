import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import { listInvoices, requestRefund } from '../../services/billing.service';

export const listInvoicesHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
  try { res.status(200).json({ success: true, items: await listInvoices(req.user.id) }); }
  catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const requestRefundHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
  try {
    const item = await requestRefund(req.user.id, req.params.invoiceId, Number(req.body.amount), typeof req.body.reason === 'string' ? req.body.reason : '');
    res.status(201).json({ success: true, item });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};
