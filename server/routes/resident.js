import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ResidentsMaster } from '../models/ResidentsMaster.js';
import { CollectionLog } from '../models/CollectionLog.js';
import { Issue } from '../models/Issue.js';
import { MonthlyCharges } from '../models/MonthlyCharges.js';

const router = express.Router();

// Get today's collection status
router.get('/status/today', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const collection = await CollectionLog.findOne({
      prop_uid: req.user.prop_uid,
      date: today,
    });

    res.json({
      prop_uid: req.user.prop_uid,
      date: today,
      status: collection ? collection.status : null,
      collected: !!collection,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm collection
router.post('/confirm-collection', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const collection = await CollectionLog.findOneAndUpdate(
      {
        prop_uid: req.user.prop_uid,
        date: today,
      },
      { status: 'resident_confirmed' },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ error: 'No collection record found for today' });
    }

    res.json({
      success: true,
      message: 'Collection confirmed',
      collection,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dispute collection
router.post('/dispute-collection', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const { reason } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const collection = await CollectionLog.findOneAndUpdate(
      {
        prop_uid: req.user.prop_uid,
        date: today,
      },
      { status: 'resident_disputed' },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ error: 'No collection record found for today' });
    }

    // Create issue
    const issue = new Issue({
      prop_uid: req.user.prop_uid,
      reported_by_role: 'resident',
      reported_by_id: req.user.userId,
      description: reason || 'Collection disputed without reason',
    });

    await issue.save();

    res.json({
      success: true,
      message: 'Collection disputed and issue reported',
      collection,
      issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get collection history (last 30 days)
router.get('/history', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const collections = await CollectionLog.find({
      prop_uid: req.user.prop_uid,
      date: { $gte: fromDate },
    }).sort({ date: -1 });

    res.json({
      prop_uid: req.user.prop_uid,
      collections,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly charges
router.get('/monthly-charges', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const charges = await MonthlyCharges.find({
      prop_uid: req.user.prop_uid,
    }).sort({ month: -1 });

    res.json({
      prop_uid: req.user.prop_uid,
      charges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report issue
router.post('/report-issue', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const issue = new Issue({
      prop_uid: req.user.prop_uid,
      reported_by_role: 'resident',
      reported_by_id: req.user.userId,
      description,
    });

    await issue.save();

    res.status(201).json({
      success: true,
      message: 'Issue reported',
      issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resident details
router.get('/details', authMiddleware, requireRole('resident'), async (req, res) => {
  try {
    const resident = await ResidentsMaster.findOne({ prop_uid: req.user.prop_uid });

    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({ resident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
