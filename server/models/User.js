import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['resident', 'collector', 'supervisor'],
      required: true,
    },
    prop_uid: {
      type: String,
      required: function () {
        return this.role === 'resident';
      },
      ref: 'ResidentsMaster',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
