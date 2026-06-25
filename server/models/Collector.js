import mongoose from 'mongoose';

const collectorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    assigned_wards: [
      {
        type: String,
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Collector = mongoose.model('Collector', collectorSchema);
