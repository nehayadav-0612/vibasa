import mongoose from 'mongoose';

const residentsMasterSchema = new mongoose.Schema(
  {
    prop_uid: { type: String, required: true, unique: true, index: true,},
    owner_name: { type: String, required: true },
    zone_no: { type: String, required: true },
    ward_no: { type: String, required: true },
    ward_name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  { timestamps: true }
);

export const ResidentsMaster = mongoose.model('ResidentsMaster', residentsMasterSchema);
