import { Router, Request, Response } from 'express';
import ChatInquiry from '../models/ChatInquiry';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, mobile, email, gymName, city, message } = req.body;

  if (!name || !mobile || !gymName || !message) {
    res.status(400).json({ error: 'name, mobile, gymName and message are required' });
    return;
  }

  const inquiry = await ChatInquiry.create({ name, mobile, email, gymName, city, message });
  res.status(201).json({ ok: true, id: inquiry._id });
});

export default router;
