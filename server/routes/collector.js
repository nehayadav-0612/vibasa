import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { Collector } from '../models/Collector.js';
import { ResidentsMaster } from '../models/ResidentsMaster.js';
import { CollectionLog } from '../models/CollectionLog.js';
import { Issue } from '../models/Issue.js';

const router = express.Router();

// Get assigned wards
router.get('/wards', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const collector = await Collector.findOne({ user_id: req.user.userId });

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    res.json({
      wards: collector.assigned_wards,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get properties for a ward
router.get('/ward/:wardNo', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const { wardNo } = req.params;

    const collector = await Collector.findOne({ user_id: req.user.userId });

    if (!collector || !collector.assigned_wards.includes(wardNo)) {
      return res.status(403).json({ error: 'Ward not assigned to this collector' });
    }

    const properties = await ResidentsMaster.find({ ward_no: wardNo });

    res.json({
      ward_no: wardNo,
      properties,
      count: properties.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark collection
router.post('/mark-collection', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const { prop_uid } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!prop_uid) {
      return res.status(400).json({ error: 'Property UID is required' });
    }

    const collector = await Collector.findOne({ user_id: req.user.userId });

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    const property = await ResidentsMaster.findOne({ prop_uid });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (!collector.assigned_wards.includes(property.ward_no)) {
      return res.status(403).json({ error: 'Property not in assigned wards' });
    }

    const existingCollection = await CollectionLog.findOne({
      prop_uid,
      date: today,
    });

    if (existingCollection) {
      return res.status(400).json({ error: 'Collection already marked for today' });
    }

    const collection = new CollectionLog({
      prop_uid,
      collector_id: collector._id,
      date: today,
      status: 'collector_marked',
    });

    await collection.save();

    res.status(201).json({
      success: true,
      message: 'Collection marked successfully',
      collection,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Undo collection (same day only)
router.post('/undo-collection', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const { prop_uid } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!prop_uid) {
      return res.status(400).json({ error: 'Property UID is required' });
    }

    const collection = await CollectionLog.findOne({
      prop_uid,
      date: today,
    });

    if (!collection) {
      return res.status(404).json({ error: 'No collection record found for today' });
    }

    await CollectionLog.deleteOne({ _id: collection._id });

    res.json({
      success: true,
      message: 'Collection undone',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's collections (for offline sync reference)
router.get('/today-collections', authMiddleware, requireRole('collector'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const collector = await Collector.findOne({ user_id: req.user.userId });

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    const collections = await CollectionLog.find({
      collector_id: collector._id,
      date: today,
    });

    res.json({
      date: today,
      collections,
      count: collections.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
