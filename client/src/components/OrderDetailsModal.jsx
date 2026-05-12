import React from 'react';
import Modal from './Modal';
import Badge from './Badge';
import { Package, MapPin, CreditCard, User } from 'lucide-react';
import { formatCurrency } from '../utils/validation';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - ${order.orderNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="border-b pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="text-primary-600" size={20} />
            <h3 className="font-semibold">Customer Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{order.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{order.user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{order.user?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-b pb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Package className="text-primary-600" size={20} />
            <h3 className="font-semibold">Order Items</h3>
          </div>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex-1">
                  <p className="font-medium">{item.name || item.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-600">
                    {item.product?.category && <span className="capitalize">{item.product.category}</span>}
                    {item.product?.brand && <span> • {item.product.brand}</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × {formatCurrency(item.price || 0)}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency((item.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(order.totalAmount || 0)}
            </span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="border-b pb-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="text-primary-600" size={20} />
            <h3 className="font-semibold">Shipping Information</h3>
          </div>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p>{order.shippingAddress?.street || 'N/A'}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.zipCode || order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country || 'Sri Lanka'}</p>
          </div>
        </div>

        {/* Payment & Status Information */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="text-primary-600" size={20} />
            <h3 className="font-semibold">Payment & Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600">Order Status</p>
              <Badge variant={getStatusBadge(order.orderStatus)}>
                {order.orderStatus}
              </Badge>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="text-gray-600">Tracking Number</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
