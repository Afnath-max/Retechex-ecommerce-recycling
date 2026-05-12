import React, { useState, useEffect, useMemo } from 'react'; // ⬅️ IMPORT useMemo
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import { ordersAPI } from '../../services/api';
import { Search, ShoppingBag, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/validation';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]); // All fetched orders
  const [loading, setLoading] = useState(true);
  
  // UI filter states (used for client-side filtering)
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // ⬅️ Client-side filtering approach: Fetch all orders only once on mount
    loadOrders();
  }, []); 
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      // Fetch ALL orders for staff to filter client-side (similar to AdminOrders)
      const response = await ordersAPI.getAll(); 
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ⬅️ CLIENT-SIDE FILTERING LOGIC using useMemo
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const statusKey = statusFilter.trim().toLowerCase();

    return (orders || []).filter((o) => {
      // 1. Status filter (if chosen)
      const matchesStatus = statusKey
        ? (o.orderStatus || '').toString().trim().toLowerCase() === statusKey
        : true;

      // 2. Search filter across order number, user name, and email
      const hayOrder = (o.orderNumber || '').toString().toLowerCase();
      const hayName = (o.user?.name || '').toString().toLowerCase();
      const hayEmail = (o.user?.email || '').toString().toLowerCase();
      
      const matchesSearch = term
        ? hayOrder.includes(term) || hayName.includes(term) || hayEmail.includes(term)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]); // Recalculate whenever orders, statusFilter, or searchTerm changes

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { orderStatus: newStatus });
      toast.success('Order status updated successfully');
      loadOrders(); // Reload all data after update
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };
  
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      await ordersAPI.delete(orderId);
      toast.success('Order deleted successfully');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setSelectedOrder(response.data.order);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load order details');
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Update order statuses and track deliveries</p>
        </div>

        {/* FILTER SECTION: Search and Status filter are present and use client-side logic */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ⬅️ NOW MAPPING OVER filteredOrders */}
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <ShoppingBag size={48} className="mx-auto mb-2 text-gray-400" />
                    No orders found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium text-primary-600">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.totalAmount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="btn-secondary btn-sm flex items-center space-x-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>

                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Approved">Approved</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </DashboardLayout>
  );
};

export default StaffOrders;
