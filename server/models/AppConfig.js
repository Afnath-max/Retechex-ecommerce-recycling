import mongoose from 'mongoose';

const appConfigSchema = new mongoose.Schema({
  bulkDiscount: {
    active: { type: Boolean, default: false },
    percent: { type: Number, default: 0, min: 0, max: 90 }
  }
}, { timestamps: true });

export default mongoose.model('AppConfig', appConfigSchema);
