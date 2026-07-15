import mongoose from 'mongoose';

// A simple, flexible "bucket" store: one document per data category
// (birds, expenses, feed, eggs, settings). Each document just holds
// whatever JSON array/object the frontend was previously keeping in
// localStorage. This makes the switch from localStorage -> MongoDB
// a drop-in replacement without needing to redesign the whole schema.
const dataStoreSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. 'birds'
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // the actual data
  },
  { timestamps: true }
);

export default mongoose.model('DataStore', dataStoreSchema);
