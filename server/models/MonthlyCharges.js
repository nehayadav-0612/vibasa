import mongoose from 'mongoose';

const monthlyChargesSchema = new mongoose.Schema(
  {
    prop_uid: {
      type: String,
      required: true,
      ref: 'ResidentsMaster',
      index: true,
    },
      owner_name: {
      type: String,
      required: true,
      ref: 'ResidentsMaster',
      index: true,
    },
      mobile: {
      type: String,
      required: true,
      ref: 'ResidentsMaster',
      index: true,
    },
    month: {
      type: String,
      required: true,
      index: true,
    },
    total_collections: {
      type: Number,
      default: 0,
    },
    missed_collections: {
      type: Number,
      default: 0,
    },
    amount_due: {
      type: Number,
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

monthlyChargesSchema.index({ prop_uid: 1, month: 1 }, { unique: true });

export const MonthlyCharges = mongoose.model('MonthlyCharges', monthlyChargesSchema);
