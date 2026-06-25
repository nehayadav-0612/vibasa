import express from 'express';
import bcryptjs from 'bcryptjs';
import { User } from '../models/User.js';
import { ResidentsMaster } from '../models/ResidentsMaster.js';
import { Collector } from '../models/Collector.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register/resident', async (req, res) => {
  try {
    const { email, password, prop_uid } = req.body;

    if (!email || !password || !prop_uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resident = await ResidentsMaster.findOne({ prop_uid });
    if (!resident) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      role: 'resident',
      prop_uid,
    });

    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      prop_uid: user.prop_uid,
    });

    res.status(201).json({
      success: true,
      message: 'Resident registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      prop_uid: user.prop_uid,
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        prop_uid: user.prop_uid,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        prop_uid: user.prop_uid,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
