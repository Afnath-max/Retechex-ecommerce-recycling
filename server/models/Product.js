import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['laptops', 'smartphones', 'wearables', 'tablets', 'accessories'],
      message: '{VALUE} is not a valid category'
    }
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  brand: {
    type: String,
    default: 'Unknown'
  },
  specs: {
    storage: String,
    ram: String,
    color: String,
    processor: String
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['listed', 'unlisted', 'out_of_stock'],
    default: 'listed'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sales: {
    type: Number,
    default: 0
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for active discount
productSchema.virtual('activeDiscount', {
  ref: 'Discount',
  localField: '_id',
  foreignField: 'productId',
  justOne: true,
  match: { 
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.lowStockThreshold && this.stockQuantity > 0;
});

// Virtual for out of stock status
productSchema.virtual('isOutOfStock').get(function() {
  return this.stockQuantity === 0;
});

// Method to calculate final price with discount
productSchema.methods.getFinalPrice = function(discount) {
  if (!discount || !discount.isActive) {
    return this.price;
  }

  if (discount.type === 'percentage') {
    return this.price * (1 - discount.value / 100);
  } else {
    return Math.max(0, this.price - discount.value);
  }
};

// Static method to get products with active discounts
productSchema.statics.getDiscountedProducts = async function() {
  return await this.aggregate([
    {
      $lookup: {
        from: 'discounts',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$productId', '$$productId'] },
              isActive: true,
              startDate: { $lte: new Date() },
              endDate: { $gte: new Date() }
            }
          }
        ],
        as: 'activeDiscounts'
      }
    },
    {
      $match: {
        'activeDiscounts.0': { $exists: true }
      }
    }
  ]);
};

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
