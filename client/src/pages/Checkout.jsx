import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../services/api';
import { CreditCard, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // New state for errors
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: '', // Matches Order.js schema
    country: 'Sri Lanka'
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      if (!response.data.cart || response.data.cart.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCart(response.data.cart);
    } catch (error) {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };
  
  // New: Field-specific change handler with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = '';

    // Input Constraint Logic
    if (name === 'city') {
      // Allow only letters and spaces for city
      if (/\d/.test(value)) {
        error = 'City name cannot contain numbers.';
        // Prevent typing numbers, but allow the user to clear the field
        newValue = value.replace(/[0-9]/g, '');
      } else if (!newValue.trim()) {
        error = 'City is required.';
      }
    } else if (name === 'zipCode') {
      // Allow only digits and limit length to 5
      if (/[^0-9]/.test(value)) {
        error = 'Postal Code must contain only numbers.';
        // Remove non-numeric characters
        newValue = value.replace(/[^0-9]/g, '');
      }
      if (newValue.length > 5) {
        newValue = newValue.slice(0, 5);
      }
      if (newValue.length < 5 && newValue.length > 0) {
        error = 'Postal Code must be exactly 5 digits.';
      } else if (!newValue.trim()) {
        error = 'Postal Code is required.';
      }
    } else if (name === 'street' && !value.trim()) {
      error = 'Street Address is required.';
    }
    
    // Update state and clear error if valid, or set error
    setShippingAddress((prev) => ({ ...prev, [name]: newValue }));
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Final form validation logic (used on submit)
  const validateForm = () => {
    const { street, city, zipCode } = shippingAddress;
    const errors = {};

    if (!street.trim()) errors.street = "Please enter your street address.";
    
    // Check city for numbers and emptiness
    if (!city.trim()) {
      errors.city = "Please enter your city.";
    } else if (/\d/.test(city)) {
       // This should be caught by handleChange, but double-check for robustness
       errors.city = 'City name cannot contain numbers.';
    }

    // Check zip code format (exactly 5 digits)
    if (!/^\d{5}$/.test(zipCode)) {
      errors.zipCode = "Please enter a valid 5-digit postal code.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get effective price (current price with discount if applicable)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run final validation
    if (!validateForm()) {
      toast.error('Please correct the shipping address details.');
      return;
    }
    
    setSubmitting(true);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          priceAtPurchase: getEffectivePrice(item)
        })),
        shippingAddress,
        paymentMethod
      };

      const response = await ordersAPI.create(orderData);
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentTotal = getCartTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={shippingAddress.street}
                    onChange={handleChange}
                    className={`input-field ${validationErrors.street ? 'border-red-500' : ''}`}
                    placeholder="123 Main Street"
                  />
                  {validationErrors.street && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleChange}
                      className={`input-field ${validationErrors.city ? 'border-red-500' : ''}`}
                      placeholder="Colombo"
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode" // Matches state
                      inputMode="numeric" // Helps mobile keyboards
                      required
                      value={shippingAddress.zipCode}
                      onChange={handleChange}
                      className={`input-field ${validationErrors.zipCode ? 'border-red-500' : ''}`}
                      placeholder="10100"
                      maxLength="5" // Enforce max length
                    />
                    {validationErrors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    className="input-field"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-primary-600 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    disabled
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map((item) => {
                  const effectivePrice = getEffectivePrice(item);
                  const itemTotal = getItemTotal(item);

                  return (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-600">{item.product.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-medium">
                          ${itemTotal.toFixed(2)}
                        </p>
                        {item.product.hasDiscount && (
                          <p className="text-xs text-green-600">
                            ${((item.product.price - effectivePrice) * item.quantity).toFixed(2)} off
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${currentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${currentTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary mt-6"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;