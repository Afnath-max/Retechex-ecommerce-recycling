import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: 'Sri Lanka' }
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
    default: 'Cash on Delivery'
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Approved', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  trackingNumber: String,
  notes: String
}, { 
  timestamps: true 
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${year}${month}-${random}`;
  }
  next();
});

// Store original state for validation
orderSchema.post('init', function() {
  this._original = this.toObject();
});

// Validate status transitions
orderSchema.pre('save', function(next) {
  if (!this.isModified('orderStatus')) return next();
  
  const validTransitions = {
    'Processing': ['Approved', 'Cancelled'],
    'Approved': ['Shipped', 'Cancelled'],
    'Shipped': ['Delivered'],
    'Delivered': [],
    'Cancelled': []
  };
  
  const oldStatus = this._original?.orderStatus || 'Processing';
  const newStatus = this.orderStatus;
  
  if (oldStatus !== newStatus) {
    const allowedTransitions = validTransitions[oldStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      return next(new Error(
        `Invalid status transition: ${oldStatus} → ${newStatus}`
      ));
    }

    // Add to status history
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date()
    });
  }
  
  next();
});

// Method to cancel order
orderSchema.methods.cancel = function() {
  if (this.orderStatus !== 'Processing') {
    throw new Error('Only orders in Processing status can be cancelled');
  }
  this.orderStatus = 'Cancelled';
};

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
