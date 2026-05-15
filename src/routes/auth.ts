import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import Gym from '../models/Gym';
import Branch from '../models/Branch';
import protect, { AuthRequest } from '../middleware/auth';
import SubscriptionTier from '../models/SubscriptionTier';

const router = Router();

const signToken = (branchId: unknown): string =>
  jwt.sign({ id: branchId }, process.env.JWT_SECRET || 'gym-secret-dev-key', { expiresIn: '30d' });

const safeBranch = (b: Record<string, unknown>) => {
  const { password: _, ...rest } = b;
  void _;
  return rest;
};

// Register gym + auto-create first (Main) branch
router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name, email, password,
      phone, address, city, state, country, website, description,
    } = req.body as Record<string, string>;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const emailExists = await Branch.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const gym = await Gym.create({ name, email, phone, address, city, state, country, website, description });

    const hashed = await bcrypt.hash(password, 12);

    let tier = await SubscriptionTier.findOne({ isActive: true });
    if (!tier) {
      tier = await SubscriptionTier.create({
        name: 'Starter',
        basePrice: 600,
        memberLimit: 100,
        serviceLimit: 5,
        staffLimit: 3,
        additionalMemberPrice: 10,
        additionalMemberUnit: 10,
        isActive: true,
      });
    }

    const branch = await Branch.create({
      gym: gym._id,
      name: 'Main Branch',
      email,
      password: hashed,
      address,
      city,
      state,
      phone,
      status: 'active',
      subscription: {
        tierId: tier._id,
        additionalMembers: 0,
        additionalStaff: 0,
        additionalServices: 0,
        additionalAmount: 0,
        status: 'active',
        startDate: DateTime.now().toUTC().toISO(),
      },
    });

    const branchObj = branch.toObject() as unknown as Record<string, unknown>;
    res.status(201).json({
      token: signToken(branch._id),
      branch: { ...safeBranch(branchObj), gym: gym.toObject() },
    });
  } catch (err) {
    next(err);
  }
});

// Branch login
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const branch = await Branch.findOne({ email: email.toLowerCase() }).populate('gym', 'name status email');
    if (!branch || !(await bcrypt.compare(password, branch.password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (branch.status !== 'active') {
      const msg = branch.status === 'blocked'
        ? 'This branch has been blocked. Contact support at hello.flexms@gmail.com.'
        : 'This branch is currently inactive. Contact your administrator.';
      res.status(403).json({ error: msg });
      return;
    }
    const gym = branch.get('gym') as { status?: string } | null;
    if (gym && gym.status !== 'active') {
      const msg = gym.status === 'blocked'
        ? 'This gym account has been blocked. Contact support at hello.flexms@gmail.com.'
        : gym.status === 'suspended'
          ? 'This gym account has been suspended. Contact support at hello.flexms@gmail.com.'
          : 'This gym account is currently inactive. Contact support at hello.flexms@gmail.com.';
      res.status(403).json({ error: msg });
      return;
    }

    const branchObj = branch.toObject() as unknown as Record<string, unknown>;
    res.json({ token: signToken(branch._id), branch: safeBranch(branchObj) });
  } catch (err) {
    next(err);
  }
});

// Get current branch
router.get('/me', protect, (req: AuthRequest, res: Response): void => {
  res.json(req.branch);
});

// Update current branch info
router.put('/me', protect, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password: _pw, email: _em, gym: _gym, ...updates } = req.body as Record<string, unknown>;
    void _pw; void _em; void _gym;
    const branch = await Branch.findByIdAndUpdate(req.branch!._id, updates, {
      new: true, runValidators: true,
    }).select('-password').populate('gym', 'name email');
    res.json(branch);
  } catch (err) {
    next(err);
  }
});

// Change branch password
router.put('/change-password', protect, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const branch = await Branch.findById(req.branch!._id);
    if (!branch) { res.status(404).json({ error: 'Not found' }); return; }
    if (!(await bcrypt.compare(currentPassword, branch.password))) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }
    branch.password = await bcrypt.hash(newPassword, 12);
    await branch.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
