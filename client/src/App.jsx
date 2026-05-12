import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EditProfile from './pages/EditProfile';
import AdminLogin from './pages/auth/AdminLogin';
import StaffLogin from './pages/auth/StaffLogin';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyAppointments from './pages/MyAppointments';
import BookAppointment from './pages/BookAppointment';
import Wishlist from './pages/Wishlist';
import ContactUS from './pages/ContactUs';
import Footer from './components/Footer';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminContactMessages from './pages/admin/ContactMessages';


// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffInventory from './pages/staff/StaffInventory';
import StaffOrders from './pages/staff/StaffOrders';
import StaffAppointments from './pages/staff/StaffAppointments';

// Conditional Navbar Component
function ConditionalNavbar() {
  const location = useLocation();
  
  // Don't show navbar on these routes
  const noNavbarRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/admin/login',
    '/staff/login',
    '/admin',
    '/staff'
  ];
  
  const shouldHideNavbar = noNavbarRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  return shouldHideNavbar ? null : <Navbar />;
}

function ConditionalFooter() {
  const location = useLocation();
  const isAdminOrStaffRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  // Hide footer on all admin and staff pages
  if (isAdminOrStaffRoute) return null;
  return <Footer />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <ConditionalNavbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/contact" element={<ContactUS/>} />

              {/* Customer Routes */}
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-appointment"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/discounts"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDiscounts />
                  </ProtectedRoute>
                }
              />

              <Route path="/admin/contact-messages" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminContactMessages />
                </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/inventory"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/orders"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/appointments"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffAppointments />
                  </ProtectedRoute>
                }
              />

              {/* Redirect /admin and /staff to dashboards */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<div className="flex items-center justify-center h-screen"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
            </Routes>
          </main>
          <ConditionalFooter /> 
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
