import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/StatCard';
import { staffAPI, appointmentsAPI, ordersAPI, productsAPI } from '../../services/api';
import { ShoppingBag, Calendar, AlertTriangle } from 'lucide-react';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get all appointments from backend (without status filter first)
      const [statsRes, appointmentsRes, ordersRes, lowStockRes] = await Promise.all([
        staffAPI.getDashboardStats(),
        appointmentsAPI.getAll({ limit: 100, page: 1 }), // Fetch ALL without status filter
        ordersAPI.getAll({ orderStatus: 'Processing' }),
        productsAPI.getLowStock(10),
      ]);

      setStats(statsRes.data.stats);

      // Get today's date in the SAME way the backend stores appointments
      // Backend uses: new Date(year, month - 1, day, 12, 0, 0, 0)
      // Which creates a date at noon in LOCAL timezone
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();

      // Create a date object the same way backend does
      const todayStart = new Date(currentYear, currentMonth, currentDate, 0, 0, 0, 0);
      const todayEnd = new Date(currentYear, currentMonth, currentDate, 23, 59, 59, 999);

      // Debug: Log what we're working with
      console.log('Today local date:', { currentYear, currentMonth, currentDate });
      console.log('All appointments fetched:', appointmentsRes.data.appointments?.length);
      
      // Filter appointments that fall within today's local date range
      const filteredAppointments = (appointmentsRes.data.appointments || []).filter((apt) => {
        if (!apt.appointmentDate) {
          console.log('No appointmentDate on:', apt);
          return false;
        }
        
        // Parse the appointment date string
        const appointmentDate = new Date(apt.appointmentDate);
        
        // Compare in local time, not UTC
        // Extract just the year, month, day in local time
        const apptYear = appointmentDate.getFullYear();
        const apptMonth = appointmentDate.getMonth();
        const apptDate = appointmentDate.getDate();
        
        console.log('Comparing appointment:', {
          raw: apt.appointmentDate,
          parsed: appointmentDate.toString(),
          extracted: { apptYear, apptMonth, apptDate },
          matches: apptYear === currentYear && apptMonth === currentMonth && apptDate === currentDate
        });
        
        // Check if it matches today's local date
        return (
          apptYear === currentYear &&
          apptMonth === currentMonth &&
          apptDate === currentDate
        );
      });
      
      console.log('Filtered today appointments:', filteredAppointments);

      setTodayAppointments(filteredAppointments.slice(0, 5));
      setPendingOrders((ordersRes.data.orders || []).slice(0, 5));
      setLowStockProducts((lowStockRes.data.products || []).slice(0, 5));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Your daily tasks and updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={ShoppingBag} color="blue" />
          <StatCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} color="purple" />
          <StatCard title="Low Stock Items" value={stats?.lowStockProducts || 0} icon={AlertTriangle} color="orange" />
        </div>

        {/* Today's Appointments */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
          {todayAppointments.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No appointments scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.user?.name || appointment.customerInfo?.name}</p>
                      <p className="text-sm text-gray-600">{appointment.appointmentTime}</p>
                      <p className="text-xs text-gray-500">{appointment.items?.length} items</p>
                    </div>
                  </div>
                  <Badge variant="warning">{appointment.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Orders</h3>
          {pendingOrders.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No pending orders</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-primary-600">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.items?.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                    <Badge variant="warning">{order.orderStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-center py-6 text-gray-500">All products well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={18} className="text-orange-600" />
                    <span className="font-semibold text-orange-600">{product.stockQuantity} left</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;