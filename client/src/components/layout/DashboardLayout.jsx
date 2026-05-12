import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Calendar,
  Tag,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Admin menu items
  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Package, label: 'Inventory', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: Tag, label: 'Discounts', path: '/admin/discounts' },
  ];

  // Staff menu items
  const staffMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
    { icon: Package, label: 'Inventory', path: '/staff/inventory' },
    { icon: ShoppingBag, label: 'Orders', path: '/staff/orders' },
    { icon: Calendar, label: 'Appointments', path: '/staff/appointments' },
  ];

  const menuItems = isAdmin ? adminMenuItems : staffMenuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <Link to={isAdmin ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RT</span>
            </div>
            <span className="text-white font-semibold text-lg">ReTechEx</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Panel Label */}
        <div className="px-6 py-3 border-b border-slate-800">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {isAdmin ? 'Admin Panel' : `Staff Panel - ${user?.assignedBranch || ''}`}
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-800">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-800 cursor-pointer">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-red-600/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-sm text-gray-600">
              Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
