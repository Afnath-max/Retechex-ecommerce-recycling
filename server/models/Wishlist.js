import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { 
  timestamps: true 
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    id => id.toString() !== productId.toString()
  );
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(
    id => id.toString() === productId.toString()
  );
};

export default mongoose.model('Wishlist', wishlistSchema);
