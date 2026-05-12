import AppConfig from '../models/AppConfig.js';

const ensureConfig = async () => {
  let cfg = await AppConfig.findOne();
  // ⭐️ Updated default structure to match what is being saved
  if (!cfg) cfg = await AppConfig.create({ 
      bulkDiscount: { 
          active: false, 
          percent: 0,
          name: 'Default Bulk Discount',
          description: '',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      } 
  });
  return cfg;
};

export const getBulkDiscount = async (req, res) => {
  try {
    const cfg = await ensureConfig();
    // ⭐️ Updated: Destructure all fields for the bulk discount config
    const { 
        active, 
        percent, 
        name, 
        description, 
        startDate, 
        endDate 
    } = cfg.bulkDiscount || { active: false, percent: 0 };
    res.json({ success: true, data: { active, percent, name, description, startDate, endDate } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load discount config' });
  }
};

export const setBulkDiscount = async (req, res) => {
  try {
    // ⭐️ Updated: Destructure all fields from client
    const { 
        active, 
        percent, 
        name, 
        description, 
        startDate, 
        endDate 
    } = req.body || {};
    
    // --- Validation Start ---
    const p = Number(percent);
    if (Number.isNaN(p) || p < 0 || p > 100) { // Changed max to 100 for consistency
      return res.status(400).json({ success: false, message: 'percent must be 0-100' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check start of today for comparison
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // ⭐️ NEW VALIDATION: Start date not in the past
    // This allows using the endpoint to *deactivate* an old discount, but not *create* a new one in the past
    if (!!active && start < startOfToday) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past when activating a discount.' });
    }

    // ⭐️ NEW VALIDATION: End date after start date
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }
    
    // ⭐️ NEW VALIDATION: Name is required for site-wide discount
    if (!!active && (!name || name.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Discount name is required when activating a discount' });
    }
    // --- Validation End ---

    const cfg = await ensureConfig();
    
    // ⭐️ Updated: Save all fields
    cfg.bulkDiscount = { 
        active: !!active, 
        percent: p, 
        name: name || cfg.bulkDiscount.name, // Keep existing name if not provided
        description: description || '',
        startDate: start,
        endDate: end
    };
    
    await cfg.save();
    res.json({ success: true, data: cfg.bulkDiscount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to save discount config' });
  }
};