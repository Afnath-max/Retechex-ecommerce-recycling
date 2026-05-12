import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  priceAtAdd: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.priceAtAdd * item.quantity);
  }, 0);
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      priceAtAdd: price
    });
  }
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (item) {
    item.quantity = quantity;
  }
};

// Method to remove item
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalAmount = 0;
};

export default mongoose.model('Cart', cartSchema);
