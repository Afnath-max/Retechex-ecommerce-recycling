// fileName: Discount.js
import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['percentage', 'fixed'],
      message: '{VALUE} is not a valid discount type'
    }
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
    validate: {
      validator: function(val) {
        if (this.type === 'percentage') {
          return val <= 100;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
  scope: {
    type: String,
    enum: ['product', 'category'],
    default: 'product'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return this.scope === 'product';
    }
  },
  category: {
    type: String,
    enum: ['laptops', 'smartphones', 'wearables', 'tablets', 'accessories'],
    required: function() {
      return this.scope === 'category';
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    // ⭐️ NEW VALIDATION: Start date must not be in the past
    validate: {
      validator: function(val) {
        // Check only the date part, ignore time for 'today'
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Allow if it's a new document or if the date is today or in the future
        if (this.isNew || val >= startOfToday) {
          return true;
        }
        return false;
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(val) {
        // ⭐️ FIX APPLIED HERE: Normalize dates to YYYYMMDD integer for safe comparison
        // This avoids timezone issues when comparing two dates at T00:00:00.000Z
        
        // Ensure this.startDate exists before attempting to call methods
        if (!this.startDate) return true; 

        // Get YYYYMMDD string and remove hyphens
        const start_date_only = this.startDate.toISOString().split('T')[0].replace(/-/g, '');
        const end_date_only = val.toISOString().split('T')[0].replace(/-/g, '');
        
        // Convert to Number and compare. End date's number must be greater than start date's number.
        return Number(end_date_only) > Number(start_date_only);
      },
      message: 'End date must be strictly after the start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Virtual to check if discount is currently valid
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Method to calculate discounted price
discountSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (!this.isValid) {
    return originalPrice;
  }

  if (this.type === 'percentage') {
    return originalPrice * (1 - this.value / 100);
  } else {
    return Math.max(0, originalPrice - this.value);
  }
};

// Static method to get active discounts
discountSchema.statics.getActiveDiscounts = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Indexes
discountSchema.index({ productId: 1, isActive: 1 });
discountSchema.index({ category: 1, isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('Discount', discountSchema);