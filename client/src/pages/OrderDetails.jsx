import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Badge from '../components/Badge';
import { ArrowLeft, Package, MapPin, CreditCard, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { validateAddress, formatCurrency } from '../utils/validation';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Sri Lanka'
  });
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data.order);
      setEditingAddress({
        street: response.data.order.shippingAddress?.street || '',
        city: response.data.order.shippingAddress?.city || '',
        postalCode: response.data.order.shippingAddress?.zipCode || response.data.order.shippingAddress?.postalCode || '',
        country: response.data.order.shippingAddress?.country || 'Sri Lanka'
      });
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = () => {
    if (order.orderStatus !== 'Processing') {
      toast.error('Can only edit address for orders being processed');
      return;
    }
    setShowEditAddressModal(true);
  };

  const handleUpdateAddress = async () => {
    const errors = validateAddress(editingAddress);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      await ordersAPI.updateAddress(id, {
        shippingAddress: {
          street: editingAddress.street,
          city: editingAddress.city,
          zipCode: editingAddress.postalCode,
          country: editingAddress.country
        }
      });
      toast.success('Delivery address updated successfully');
      setShowEditAddressModal(false);
      loadOrder();
    } catch (error) {
      toast.error('Failed to update address');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Processing': 'warning',
      'Approved': 'info',
      'Shipped': 'purple',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link to="/my-orders" className="btn-primary inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/my-orders" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Orders
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
          </div>
          <Badge variant={getStatusBadge(order.orderStatus)}>
            {order.orderStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="text-gray-400" size={32} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.name || item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.product?.category || 'Category'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatCurrency(item.price || item.priceAtPurchase || 0)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency((item.price || item.priceAtPurchase || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              {order.orderStatus === 'Processing' && (
                <button
                  onClick={handleEditAddress}
                  className="btn-secondary btn-sm flex items-center space-x-1"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900">{order.shippingAddress?.street || 'N/A'}</p>
              <p className="text-gray-900">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.zipCode || order.shippingAddress?.postalCode || ''}
              </p>
              <p className="text-gray-900">{order.shippingAddress?.country || 'Sri Lanka'}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="text-primary-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Payment Information</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                <p className="text-sm text-gray-600 mt-2">Payment Status</p>
                <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.orderStatus !== 'Processing' && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Order {order.orderStatus}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Address Modal */}
      <Modal
        isOpen={showEditAddressModal}
        onClose={() => {
          setShowEditAddressModal(false);
          setAddressErrors({});
        }}
        title="Edit Delivery Address"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={editingAddress.street}
              onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
              className={`input-field ${addressErrors.street ? 'border-red-500' : ''}`}
              placeholder="123 Main Street"
            />
            {addressErrors.street && (
              <p className="text-red-500 text-xs mt-1">{addressErrors.street}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={editingAddress.city}
              onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
              className={`input-field ${addressErrors.city ? 'border-red-500' : ''}`}
              placeholder="Colombo"
            />
            {addressErrors.city && (
              <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={editingAddress.postalCode}
              onChange={(e) => setEditingAddress({ ...editingAddress, postalCode: e.target.value })}
              className={`input-field ${addressErrors.postalCode ? 'border-red-500' : ''}`}
              placeholder="10100"
              maxLength="5"
            />
            {addressErrors.postalCode && (
              <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={editingAddress.country}
              disabled
              className="input-field bg-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowEditAddressModal(false);
                setAddressErrors({});
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateAddress}
              className="btn-primary"
            >
              Update Address
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;