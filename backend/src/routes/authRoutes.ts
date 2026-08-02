import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import {
  comparePassword,
  createTokenPair,
  hashPassword,
  verifyToken,
} from '../utils/auth.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['employee', 'reviewer', 'admin']).optional(),
  skills: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid registration payload' });
    return;
  }

  const { name, email, password, role, skills } = parsed.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role ?? 'employee',
    skills: skills ?? [],
  });

  const tokens = createTokenPair({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    },
    ...tokens,
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid login payload' });
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const tokens = createTokenPair({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    },
    ...tokens,
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.sub).select('-passwordHash');

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    },
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken;
  if (!refreshToken || typeof refreshToken !== 'string') {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const payload = verifyToken(refreshToken, 'refresh');
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const tokens = createTokenPair({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({ message: 'Tokens refreshed', ...tokens });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

export default router;
