import ContactMessage from '../models/ContactMessage.js';

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, topic, branch, message, agree } = req.body || {};

    // server-side validation (simple mirror of your client checks)
    if (!name?.trim())  return res.status(400).json({ success:false, message:'Name is required' });
    if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ success:false, message:'Valid email required' });
    if (!/^0\d{9}$/.test(phone || '')) return res.status(400).json({ success:false, message:'Sri Lankan phone (0XXXXXXXXX) required' });
    if (!message?.trim()) return res.status(400).json({ success:false, message:'Message is required' });

    const doc = await ContactMessage.create({
      name, email, phone, topic, branch, message, agree,
      user: req.user?._id ?? undefined, // if you have auth
    });

    // Optional: enqueue email/Slack/etc. here

    return res.status(201).json({ success:true, data:{ id: doc._id } });
  } catch (err) {
    console.error('createContactMessage error', err);
    return res.status(500).json({ success:false, message:'Failed to submit message' });
  }
};

// (Optional) Admin list
export const listContactMessages = async (req, res) => {
  try {
    const { page=1, limit=20 } = req.query;
    const skip = (Number(page)-1)*Number(limit);
    const [items, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt:-1 }).skip(skip).limit(Number(limit)),
      ContactMessage.countDocuments()
    ]);
    res.json({ success:true, total, page:Number(page), items });
  } catch (e) {
    res.status(500).json({ success:false, message:'Failed to load messages' });
  }
};