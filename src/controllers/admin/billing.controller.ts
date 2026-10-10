import { Request, Response } from 'express';
import { completeRefund } from '../../services/billing.service';

export const completeRefundHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await completeRefund(req.params.refundId, typeof req.body.providerReference === 'string' ? req.body.providerReference : undefined);
    res.status(200).json({ success: true, item });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};
