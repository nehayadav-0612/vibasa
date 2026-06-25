import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    prop_uid: {
      type: String,
      required: true,
      ref: 'ResidentsMaster',
      index: true,
    },
    reported_by_role: {
      type: String,
      enum: ['resident', 'collector'],
      required: true,
    },
    reported_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolved_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Issue = mongoose.model('Issue', issueSchema);
