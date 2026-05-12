import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/StatCard';
import { adminAPI, productsAPI } from '../../services/api';
import { Users, Package, ShoppingBag, DollarSign, AlertTriangle, Download } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/download';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data
      const [statsRes, trendRes, distRes, topRes, lowStockRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRevenueTrend('30days'),
        adminAPI.getOrderDistribution(),
        adminAPI.getTopProducts(5),
        productsAPI.getLowStock(10)
      ]);

      setStats(statsRes.data.stats);
      setRevenueTrend(trendRes.data.trend);
      setOrderDistribution(distRes.data.distribution);
      setTopProducts(topRes.data.topProducts);
      setLowStockProducts(lowStockRes.data.products);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSummary = async () => {
    try {
      const { data } = await adminAPI.downloadSummaryReport();
      const blob = new Blob([data], { type: 'application/pdf' });
      const filename = `admin-summary-${new Date().toISOString().slice(0,10)}.pdf`;
      downloadBlob(blob, filename);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to download summary');
    }
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Download summary button (navbar area of dashboard header) */}
          <button
            onClick={handleDownloadSummary}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-full text-white font-semibold
                       bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:opacity-95 shadow-sm"
            title="Download summarized PDF (orders, appointments, inventory, discounts)"
          >
            <Download size={18} />
            Download report
          </button>

          <Link
              to="/admin/contact-messages"
            className="inline-flex items-center gap-2 px-4 h-11 rounded-full border border-gray-300 hover:bg-gray-50"
          >
            View Contact Messages
          </Link>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            trend={stats?.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth}` : '0'}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            trend={stats?.lowStockProducts > 0 ? `-${stats.lowStockProducts} low` : 'All stocked'}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            trend={`${stats?.pendingOrders || 0} pending`}
            icon={ShoppingBag}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            trend={`$${(stats?.revenueThisMonth || 0).toLocaleString()} this month`}
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Products</h3>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.sales} sales</p>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
              <span className="badge badge-warning">{lowStockProducts.length} items</span>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">All products well stocked!</p>
              ) : (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={18} className="text-orange-600" />
                      <span className="font-semibold text-orange-600">{product.stockQuantity} left</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Appointments</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.pendingAppointments || 0}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.lowStockProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;