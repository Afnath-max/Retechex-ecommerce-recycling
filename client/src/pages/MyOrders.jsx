import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Badge from '../components/Badge';
import { Package, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/validation';

// Define the base URL for images
const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const STATUS_ORDER = {
  processing: 1,
  approved: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 5,
};

const normalizeStatus = (status) => (status ? status.toString().trim().toLowerCase() : 'unknown');
const getStatusRank = (status) => STATUS_ORDER[normalizeStatus(status)] ?? 99;

const getStatusBadge = (status) => {
  const normalized = normalizeStatus(status);
  const variants = {
    processing: 'warning',
    approved: 'info',
    shipped: 'purple',
    delivered: 'success',
    cancelled: 'danger',
  };
  return variants[normalized] || 'default';
};

// ✅ NEW HELPER FUNCTION: To construct the final image URL, adapted from Marketplace/Admin logic
const getProductImageSrc = (item) => {
  // Order items might store product details in 'item.product' or flatly in 'item'
  const productData = item.product || item;
  
  // Check multiple potential fields for the image path/name
  const imagePath = productData.images?.[0] || productData.image || productData.imageUrl || '';
  
  if (!imagePath) return '';

  // If already a full URL, return it as is.
  if (imagePath.startsWith('http')) {
      return imagePath;
  }
  
  // Construct the absolute path: API_BASE + / + path without leading slash
  // This is the most common and reliable pattern for serving static assets from a backend root.
  let finalPath = imagePath;
  
  // Remove leading slash if present
  if (finalPath.startsWith('/')) {
      finalPath = finalPath.substring(1);
  }
  
  // Check if 'uploads/' is already at the beginning of the path (optional based on backend setup)
  if (!finalPath.toLowerCase().startsWith('uploads/')) {
      finalPath = `uploads/${finalPath}`;
  }

  // Ensure API_BASE does not end with a slash before combining
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  
  return `${base}/${finalPath}`;
};


const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getMy();
      const normalized = (response?.data?.orders ?? []).map((order) => ({
        ...order,
        _normalizedStatus: normalizeStatus(order.orderStatus),
        _statusRank: getStatusRank(order.orderStatus),
        _createdAt: order.createdAt ? new Date(order.createdAt).getTime() : 0,
        _totalAmount: Number(order.totalAmount ?? 0),
      }));
      setOrders(normalized);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await ordersAPI.cancel(orderId);
      toast.success('Order cancelled successfully');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Apply client-side filter first
  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter(
      (o) => normalizeStatus(o.orderStatus) === normalizeStatus(statusFilter)
    );
  }, [orders, statusFilter]);

  // Then sort the filtered results
  const sortedOrders = useMemo(() => {
    const copy = [...filteredOrders];
    switch (sortOption) {
      case 'newest':
        return copy.sort((a, b) => b._createdAt - a._createdAt);
      case 'oldest':
        return copy.sort((a, b) => a._createdAt - b._createdAt);
      case 'highAmount':
        return copy.sort((a, b) => b._totalAmount - a._totalAmount);
      case 'lowAmount':
        return copy.sort((a, b) => a._totalAmount - b._totalAmount);
      case 'status':
        return copy.sort((a, b) => {
          const diff = a._statusRank - b._statusRank;
          return diff !== 0 ? diff : b._createdAt - a._createdAt;
        });
      default:
        return copy;
    }
  }, [filteredOrders, sortOption]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link to="/marketplace" className="btn-primary">
          Continue Shopping
        </Link>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        {/* FILTER DROPDOWN */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Approved">Approved</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* SORT DROPDOWN */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="input-field"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highAmount">Highest Amount</option>
          <option value="lowAmount">Lowest Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900">No orders found</h2>
          <p className="text-gray-600 mb-6">Start shopping to create your first order</p>
          <Link to="/marketplace" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-bold text-primary-600">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed on{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <Badge variant={getStatusBadge(order.orderStatus)}>
                  {order.orderStatus || '—'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.map((item, index) => {
                  const imageSrc = getProductImageSrc(item); // ✅ Get image source for the item
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        {/* ✅ MODIFICATION: Display Image or Placeholder */}
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item?.name || item?.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="text-gray-400" size={24} />
                          </div>
                        )}
                        
                        <div>
                          <p className="font-medium">
                            {item?.name || item?.product?.name || 'Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item?.quantity ?? 0}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(
                          (Number(item?.price) || 0) * (Number(item?.quantity) || 0)
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order._totalAmount)}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </Link>
                  {order._normalizedStatus === 'processing' && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="btn-danger"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders; 