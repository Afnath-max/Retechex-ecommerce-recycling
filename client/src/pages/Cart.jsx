import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

// Define the base URL for images
const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data.cart);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateItem(productId, { quantity: newQuantity });
      loadCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      toast.success('Item removed from cart');
      loadCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  // Calculate the effective price per item (accounting for current discount)
  const getEffectivePrice = (item) => {
    if (item.product.hasDiscount && item.product.finalPrice) {
      return item.product.finalPrice;
    }
    return item.product.price;
  };

  // Calculate item total
  const getItemTotal = (item) => {
    return getEffectivePrice(item) * item.quantity;
  };

  // Calculate cart total with current prices
  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  // Calculate total savings
  const getTotalSavings = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      if (item.product.hasDiscount) {
        return sum + ((item.product.price - item.product.finalPrice) * item.quantity);
      }
      return sum;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentTotal = getCartTotal();
  const totalSavings = getTotalSavings();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link to="/marketplace" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const itemTotal = getItemTotal(item);
              const hasDiscount = item.product.hasDiscount;
              const originalPrice = item.product.price;
              
              // ✅ MODIFICATION: Determine the correct image source
              const imagePath = item.product.images?.[0] || item.product.imageUrl || '';
              const imageSrc = imagePath.startsWith('http')
                ? imagePath
                : `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;


              return (
                <div key={item.product._id} className="card">
                  <div className="flex items-center space-x-4">
                    {imageSrc ? (
                      <img
                        // ✅ MODIFICATION: Use the constructed imageSrc
                        src={imageSrc}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="text-gray-400" size={32} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.product.category}</p>
                      
                      {/* Price Display */}
                      <div className="mt-2 flex items-center space-x-2">
                        <p className="text-lg font-bold text-primary-600">
                          ${effectivePrice.toFixed(2)}
                        </p>
                        {hasDiscount && (
                          <p className="text-sm text-gray-500 line-through">
                            ${originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Discount badge */}
                      {hasDiscount && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Save ${((originalPrice - effectivePrice) * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right min-w-fit">
                      <p className="text-lg font-bold text-gray-900">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>${currentTotal.toFixed(2)}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Total Savings</span>
                    <span>-${totalSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${currentTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/marketplace"
                className="block text-center text-primary-600 hover:text-primary-700 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;