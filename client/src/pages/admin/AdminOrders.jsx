import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { ordersAPI } from '../../services/api';
import { Search, Eye, Package, Download, Trash2 } from 'lucide-react'; // ⬅️ Import Trash2
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/download';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // UI filters (client-side)
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []); // fetch once on mount

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Fetch ALL orders; filtering happens client-side
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { orderStatus: newStatus });
      toast.success('Order status updated successfully');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };
  
  // ⬅️ ADDED DELETE FUNCTIONALITY
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      await ordersAPI.delete(orderId); // Assuming ordersAPI has a delete method
      toast.success('Order deleted successfully');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleDownloadOrderPdf = async (order) => {
    try {
      const { data } = await ordersAPI.downloadPDF(order._id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const filename = `order-${(order.orderNumber || order._id || '').toString().slice(-8).toUpperCase()}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download PDF');
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
      Processing: 'warning',
      Approved: 'info',
      Shipped: 'purple',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const getPaymentBadge = (status) => (status === 'Paid' ? 'success' : 'warning');

  const handleDownloadAllOrders = async () => {
    try {
      toast.loading('Generating report...');
      const csvContent = generateOrdersCSV(filteredOrders); // export what’s on screen
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `orders-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  const generateOrdersCSV = (list) => {
    const headers = ['Order Number', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status'];
    const rows = (list || []).map(order => [
      order.orderNumber,
      order.user?.name || 'N/A',
      new Date(order.createdAt).toLocaleDateString(),
      order.items?.length ?? 0,
      `Rs. ${Number(order.totalAmount ?? 0).toFixed(2)}`,
      order.paymentStatus ?? 'N/A',
      order.orderStatus ?? 'N/A'
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  // ---- CLIENT-SIDE FILTERING ----
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const statusKey = statusFilter.trim().toLowerCase();

    return (orders || []).filter((o) => {
      // status filter (if chosen)
      const matchesStatus = statusKey
        ? (o.orderStatus || '').toString().trim().toLowerCase() === statusKey
        : true;

      // search filter across order number, user name, and email
      const hayOrder = (o.orderNumber || '').toString().toLowerCase();
      const hayName = (o.user?.name || '').toString().toLowerCase();
      const hayEmail = (o.user?.email || '').toString().toLowerCase();
      const matchesSearch = term
        ? hayOrder.includes(term) || hayName.includes(term) || hayEmail.includes(term)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadAllOrders}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total Orders:</span>
              <span className="text-xl font-bold text-primary-600">{filteredOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={loadOrders}
                className="px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
                title="Refresh from server"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-2 text-gray-400" />
                    No orders found
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
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">
                      ${Number(order.totalAmount ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.orderStatus)}>{order.orderStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadOrderPdf(order)}
                          className="p-2 text-slate-700 hover:bg-slate-100 rounded"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        {/* ⬅️ ADDED DELETE BUTTON */}
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
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Modal toolbar */}
            <div className="flex justify-end">
              <button
                onClick={() => handleDownloadOrderPdf(selectedOrder)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-sm">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      ${(Number(item.priceAtPurchase) * Number(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary-600">${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <Badge variant={getStatusBadge(selectedOrder.orderStatus)}>
                  {selectedOrder.orderStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge variant={getPaymentBadge(selectedOrder.paymentStatus)}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminOrders;