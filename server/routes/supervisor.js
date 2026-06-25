import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import bcryptjs from 'bcryptjs';
import { authMiddleware, requireRole, generateToken } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { ResidentsMaster } from '../models/ResidentsMaster.js';
import { Collector } from '../models/Collector.js';
import { CollectionLog } from '../models/CollectionLog.js';
import { Issue } from '../models/Issue.js';
import { MonthlyCharges } from '../models/MonthlyCharges.js';
import { validateCSVHeaders, validateCSVRow, normalizeCSVRow, } from '../utils/csvValidator.js';
import { get } from 'http';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Bootstrap supervisor account (only works if no supervisor exists)
router.post('/bootstrap', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingSupervisor = await User.findOne({ role: 'supervisor' });

    if (existingSupervisor) {
      return res.status(400).json({ error: 'Supervisor account already exists' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const supervisor = new User({email, passwordHash, role: 'supervisor'});

    await supervisor.save();

    const token = generateToken({
      userId: supervisor._id,
      email: supervisor.email,
      role: supervisor.role,
    });

    res.status(201).json({
      success: true,
      message: 'Supervisor account created',
      token,
      user: {
        _id: supervisor._id,
        email: supervisor.email,
        role: supervisor.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Import: Preview
router.post(
  '/residents/import-preview',
  authMiddleware,
  requireRole('supervisor'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results = [];
      const errors = [];
      let rowNum = 0;

      await new Promise((resolve, reject) => {
        Readable.from([req.file.buffer])
          .pipe(csvParser())
          .on('data', (row) => {
            rowNum++;

            const validation = validateCSVRow(row, rowNum);
            if (!validation.valid) {
              errors.push(...validation.errors);
              return;
            }

            const normalized = normalizeCSVRow(row);
            results.push(normalized);
          })
          .on('headers', (headers) => {
            const headerValidation = validateCSVHeaders(headers);
            if (!headerValidation.valid) {
              reject(new Error(headerValidation.error));
            }
          })
          .on('error', reject)
          .on('end', resolve);
      });

      res.json({
        total_rows: rowNum,
        valid_rows: results.length,
        error_rows: errors.length,
        errors: errors.slice(0, 10),
        preview: results.slice(0, 5),
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CSV Import: Confirm
router.post('/residents/import-confirm', authMiddleware, requireRole('supervisor'), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results = [];
      const errors = [];
      const skipped = [];
      let rowNum = 0;

      await new Promise((resolve, reject) => {
        Readable.from([req.file.buffer])
          .pipe(csvParser())
          .on('data', (row) => {
            rowNum++;

            const validation = validateCSVRow(row, rowNum);
            if (!validation.valid) {
              errors.push(...validation.errors);
              return;
            }

            const normalized = normalizeCSVRow(row);
            results.push({ row_num: rowNum, data: normalized });
          })
          .on('headers', (headers) => {
            const headerValidation = validateCSVHeaders(headers);
            if (!headerValidation.valid) {
              reject(new Error(headerValidation.error));
            }
          })
          .on('error', reject)
          .on('end', resolve);
      });

      let imported = 0;

      for (const { row_num, data } of results) {
        const existing = await ResidentsMaster.findOne({ prop_uid: data.prop_uid });

        if (existing) {
          skipped.push({
            row: row_num,
            prop_uid: data.prop_uid,
            reason: 'Duplicate property UID',
          });
          continue;
        }

        const resident = new ResidentsMaster(data);
        await resident.save();
        imported++;
      }

      res.json({
        success: true,
        total_processed: rowNum,
        imported,
        skipped: skipped.length,
        errors: errors.length,
        skipped_details: skipped.slice(0, 10),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Manage residents: List all
router.get('/residents', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const residents = await ResidentsMaster.find().sort({ prop_uid: 1 });
    res.json({
      residents,
      count: residents.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage residents: Create resident
router.post('/residents', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { prop_uid, owner_name, zone_no, ward_no, ward_name, address, mobile, lat, lng } = req.body;

    if (!prop_uid || !owner_name || !zone_no || !ward_no || !ward_name || !address || !mobile) {
      return res.status(400).json({
        error: 'All fields (prop_uid, owner_name, zone_no, ward_no, ward_name, address, mobile) are required',
      });
    }

    const existing = await ResidentsMaster.findOne({ prop_uid });
    if (existing) {
      return res.status(400).json({ error: 'Resident with this property UID already exists' });
    }

    const resident = new ResidentsMaster({
      prop_uid,
      owner_name,
      zone_no,
      ward_no,
      ward_name,
      address,
      mobile,
      lat,
      lng,
    });

    await resident.save();

    res.status(201).json({
      success: true,
      message: 'Resident created',
      resident,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage residents: Update resident
router.patch('/residents/:prop_uid', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { prop_uid } = req.params;
    const { owner_name, zone_no, ward_no, ward_name, address, mobile, lat, lng } = req.body;

    const resident = await ResidentsMaster.findOne({ prop_uid });
    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    // Update only provided fields
    if (owner_name) resident.owner_name = owner_name;
    if (zone_no) resident.zone_no = zone_no;
    if (ward_no) resident.ward_no = ward_no;
    if (ward_name) resident.ward_name = ward_name;
    if (address) resident.address = address;
    if (mobile) resident.mobile = mobile;
    if (lat !== undefined) resident.lat = lat;
    if (lng !== undefined) resident.lng = lng;

    await resident.save();

    res.json({
      success: true,
      message: 'Resident updated',
      resident,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage residents: Delete resident
router.delete('/residents/:prop_uid', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { prop_uid } = req.params;

    const resident = await ResidentsMaster.findOneAndDelete({ prop_uid });
    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({
      success: true,
      message: 'Resident deleted',
      resident,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage collectors: List all
router.get('/collectors', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const collectors = await Collector.find().populate('user_id', 'email');

    res.json({
      collectors,
      count: collectors.length,

    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage collectors: Create collector and user
router.post('/collectors', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { email, password, name, phone, assigned_wards } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        error: 'Email, password, name, and phone are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      role: 'collector',
    });

    await user.save();

    const collector = new Collector({
      user_id: user._id,
      name,
      phone,
      email,
      assigned_wards: assigned_wards || [],
      active: true,
    });

    await collector.save();

    res.status(201).json({
      success: true,
      message: 'Collector created',
      collector,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage collectors: Assign wards
router.patch('/collectors/:collectorId/assign-wards', authMiddleware, requireRole('supervisor'), async (req, res) => {
    try {
      const { assigned_wards } = req.body;

      if (!Array.isArray(assigned_wards)) {
        return res.status(400).json({ error: 'assigned_wards must be an array' });
      }

      const collector = await Collector.findByIdAndUpdate(
        req.params.collectorId,
        { assigned_wards },
        { new: true }
      );

      if (!collector) {
        return res.status(404).json({ error: 'Collector not found' });
      }

      res.json({
        success: true,
        message: 'Wards assigned',
        collector,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// KPI Dashboard
router.get('/kpi', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalResidents = await ResidentsMaster.countDocuments();
    const totalCollectors = await Collector.countDocuments();
    const collectionsToday = await CollectionLog.countDocuments({ date: today });
    const pendingIssues = await Issue.countDocuments({ resolved: false });

    res.json({
      total_residents: totalResidents,
      total_collectors: totalCollectors,
      collections_today: collectionsToday,
      pending_issues: pendingIssues,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issues: List and resolve
router.get('/issues', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { resolved } = req.query;
    const filter = {};

    if (resolved !== undefined) {
      filter.resolved = resolved === 'true';
    }

    const issues = await Issue.find(filter)
      .populate('reported_by_id', 'email')
      .sort({ createdAt: -1 });

    res.json({
      issues,
      count: issues.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve issue
router.patch('/issues/:issueId/resolve', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      {
        resolved: true,
        resolved_at: new Date(),
      },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({
      success: true,
      message: 'Issue resolved',
      issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate monthly charges
router.post('/generate-monthly-charges', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { month } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format (YYYY-MM)' });
    }

    const residents = await ResidentsMaster.find();
    const chargeRate = 50;
    const missedPenalty = 20;

    let created = 0;
    let updated = 0;

    for (const resident of residents) {
      const collectionsCount = await CollectionLog.countDocuments({
        prop_uid: resident.prop_uid,
        date: { $gte: `${month}-01`, $lt: getNextMonth(month) },
        status: { $in: ['collector_marked', 'resident_confirmed'] },
      });

      const Days = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const missedCount = Math.max(0, Days - collectionsCount);
      //const amountDue = collectionsCount * chargeRate + missedCount * missedPenalty;
      const amountDue = collectionsCount * chargeRate; // No penalty for missed collections, just charge for what was collected

      const existing = await MonthlyCharges.findOne({
        prop_uid: resident.prop_uid,
        month,
      });

      if (existing) {
        await MonthlyCharges.updateOne(
          { _id: existing._id },
          {
            total_collections: collectionsCount,
            missed_collections: missedCount,
            amount_due: amountDue,
          }
        );
        updated++;
      } else {
        const charge = new MonthlyCharges({
          prop_uid: resident.prop_uid,
          owner_name: resident.owner_name,
          mobile: resident.mobile,
          month,
          total_collections: collectionsCount,
          missed_collections: missedCount,
          amount_due: amountDue,
        });

        await charge.save();
        created++;
      }
    }

    res.json({
      success: true,
      message: 'Monthly charges generated',
      month,
      created,
      updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly billing overview
router.get('/billing/:month', authMiddleware, requireRole('supervisor'), async (req, res) => {
  try {
    const { month } = req.params;

    const charges = await MonthlyCharges.find({ month }).sort({ prop_uid: 1 });

    const totalDue = charges.reduce((sum, c) => sum + c.amount_due, 0);
    const totalPaid = charges
      .filter((c) => c.paid)
      .reduce((sum, c) => sum + c.amount_due, 0);

    res.json({
      month,
      //charges: charges.slice(0, 100),remove limit to show all charges, pagination can be implemented later if needed
      charges,
      total_charges: charges.length,
      total_due: totalDue,
      total_paid: totalPaid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getNextMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month), 1);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

export default router;
