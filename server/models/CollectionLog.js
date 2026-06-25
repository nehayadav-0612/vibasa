import mongoose from 'mongoose';

const collectionLogSchema = new mongoose.Schema(
  {
    prop_uid: {
      type: String,
      required: true,
      ref: 'ResidentsMaster',
      index: true,
    },
    collector_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['collector_marked', 'resident_confirmed', 'resident_disputed', 'undone'],
      default: 'collector_marked',
    },
  },
  { timestamps: true }
);

collectionLogSchema.index({ prop_uid: 1, date: 1 });

export const CollectionLog = mongoose.model('CollectionLog', collectionLogSchema);
