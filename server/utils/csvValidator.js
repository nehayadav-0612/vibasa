const REQUIRED_CSV_HEADERS = [
  'prop_uid',
  'owner_name',
  'zone_no',
  'ward_no',
  'ward_name',
  'address',
  'mobile',
];

const OPTIONAL_CSV_HEADERS = ['lat', 'lng'];

export function validateCSVHeaders(headers) {
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

export function validateCSVRow(row, rowNumber) {
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

export function normalizeCSVRow(row) {
  return {
    prop_uid: row.prop_uid.toString().trim(),
    owner_name: row.owner_name.toString().trim(),
    zone_no: row.zone_no.toString().trim(),
    ward_no: row.ward_no.toString().trim(),
    ward_name: row.ward_name.toString().trim(),
    address: row.address.toString().trim(),
    mobile: row.mobile.toString().trim(),
    lat: row.lat ? parseFloat(row.lat) : null,
    lng: row.lng ? parseFloat(row.lng) : null,
  };
}
