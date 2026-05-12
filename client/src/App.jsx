import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const StaffLogin = lazy(() => import('./pages/auth/StaffLogin'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ContactUS = lazy(() => import('./pages/ContactUs'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminDiscounts = lazy(() => import('./pages/admin/AdminDiscounts'));
const AdminContactMessages = lazy(() => import('./pages/admin/ContactMessages'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffInventory = lazy(() => import('./pages/staff/StaffInventory'));
const StaffOrders = lazy(() => import('./pages/staff/StaffOrders'));
const StaffAppointments = lazy(() => import('./pages/staff/StaffAppointments'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
    </div>
  );
}

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </main>
          <ConditionalFooter /> 
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
