import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, trim: true },
    phone:  { type: String, required: true, trim: true },
    topic:  { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    message:{ type: String, required: true, trim: true, maxlength: 2000 },
    agree:  { type: Boolean, default: false },
    // optional: link to user if logged in
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);