#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_CSV_HEADERS = [
  'prop_uid',
  'owner_name',
  'zone_no',
  'ward_no',
  'ward_name',
  'address',
  'mobile',
  'propery_type',
];

function validateCSVHeaders(headers) {
  const missingHeaders = REQUIRED_CSV_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    return {
      valid: false,
      error: `Missing required headers: ${missingHeaders.join(', ')}`,
    };
  }

  return { valid: true };
}

function validateCSVRow(row, rowNumber) {
  const errors = [];

  REQUIRED_CSV_HEADERS.forEach((header) => {
    if (!row[header] || row[header].toString().trim() === '') {
      errors.push(`Row ${rowNumber}: Missing required field "${header}"`);
    }
  });

  if (row.lat && isNaN(parseFloat(row.lat))) {
    errors.push(`Row ${rowNumber}: Invalid latitude value`);
  }

  if (row.lng && isNaN(parseFloat(row.lng))) {
    errors.push(`Row ${rowNumber}: Invalid longitude value`);
  }

  if (row.mobile && !/^\d{10}$/.test(row.mobile.toString().replace(/\D/g, ''))) {
    errors.push(`Row ${rowNumber}: Invalid mobile number`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

function normalizeCSVRow(row) {
  return {
    prop_uid: row.prop_uid.toString().trim(),
    owner_name: row.owner_name.toString().trim(),
    zone_no: row.zone_no.toString().trim(),
    ward_no: row.ward_no.toString().trim(),
    ward_name: row.ward_name.toString().trim(),
    address: row.address.toString().trim(),
    mobile: row.mobile.toString().trim(),
    property_type: row.propery_type.toString().trim(),
    lat: row.lat ? parseFloat(row.lat) : null,
    lng: row.lng ? parseFloat(row.lng) : null,
  };
}

async function importResidents(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-waste';
    await mongoose.connect(mongoUri);

    const residentsMasterSchema = new mongoose.Schema(
      {
        prop_uid: {
          type: String,
          required: true,
          unique: true,
          index: true,
        },
        owner_name: { type: String, required: true },
        zone_no: { type: String, required: true },
        ward_no: { type: String, required: true },
        ward_name: { type: String, required: true },
        address: { type: String, required: true },
        mobile: { type: String, required: true },
        property_type: { type: String, required: false },
        lat: { type: Number },
        lng: { type: Number },
      },
      { timestamps: true }
    );

    const ResidentsMaster = mongoose.model('ResidentsMaster', residentsMasterSchema);

    const results = [];
    const errors = [];
    const skipped = [];
    let rowNum = 0;
    let validationFailed = false;

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', (headers) => {
          const headerValidation = validateCSVHeaders(headers);
          if (!headerValidation.valid) {
            validationFailed = true;
            console.error(`\n❌ ${headerValidation.error}`);
            reject(new Error(headerValidation.error));
          }
        })
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
        .on('error', reject)
        .on('end', resolve);
    });

    if (validationFailed) {
      process.exit(1);
    }

    console.log(`\n📊 CSV Validation Summary:`);
    console.log(`   Total rows: ${rowNum}`);
    console.log(`   Valid rows: ${results.length}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\n❌ Validation errors (first 10):`);
      errors.slice(0, 10).forEach((err) => console.log(`   ${err}`));
    }

    let imported = 0;

    for (const data of results) {
      const existing = await ResidentsMaster.findOne({ prop_uid: data.prop_uid });

      if (existing) {
        skipped.push({
          prop_uid: data.prop_uid,
          reason: 'Duplicate property UID',
        });
        continue;
      }

      const resident = new ResidentsMaster(data);
      await resident.save();
      imported++;
    }

    console.log(`\n✅ Import Results:`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped.length}`);

    if (skipped.length > 0) {
      console.log(`\n⚠️  Skipped records (first 5):`);
      skipped.slice(0, 5).forEach((record) => {
        console.log(`   ${record.prop_uid}: ${record.reason}`);
      });
    }

    await mongoose.disconnect();

    console.log(`\n✨ Import completed successfully!`);
  } catch (error) {
    console.error(`\n❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: import-residents <path-to-csv-file>');
  console.error('Example: import-residents residents.csv');
  process.exit(1);
}

importResidents(filePath);
