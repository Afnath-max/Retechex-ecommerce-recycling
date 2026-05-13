import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { pageLoaders } from './routes/preloadRoutes';
import { warmPublicData } from './services/api';

const Home = lazy(pageLoaders.home);
const Login = lazy(pageLoaders.login);
const Register = lazy(pageLoaders.register);
const ForgotPassword = lazy(pageLoaders.forgotPassword);
const EditProfile = lazy(pageLoaders.editProfile);
const AdminLogin = lazy(pageLoaders.adminLogin);
const StaffLogin = lazy(pageLoaders.staffLogin);
const Marketplace = lazy(pageLoaders.marketplace);
const ProductDetails = lazy(pageLoaders.productDetails);
const Cart = lazy(pageLoaders.cart);
const Checkout = lazy(pageLoaders.checkout);
const MyOrders = lazy(pageLoaders.myOrders);
const OrderDetails = lazy(pageLoaders.orderDetails);
const MyAppointments = lazy(pageLoaders.myAppointments);
const BookAppointment = lazy(pageLoaders.bookAppointment);
const Wishlist = lazy(pageLoaders.wishlist);
const ContactUS = lazy(pageLoaders.contact);
const AdminDashboard = lazy(pageLoaders.adminDashboard);
const AdminProducts = lazy(pageLoaders.adminProducts);
const AdminOrders = lazy(pageLoaders.adminOrders);
const AdminAppointments = lazy(pageLoaders.adminAppointments);
const AdminUsers = lazy(pageLoaders.adminUsers);
const AdminDiscounts = lazy(pageLoaders.adminDiscounts);
const AdminContactMessages = lazy(pageLoaders.adminContactMessages);
const StaffDashboard = lazy(pageLoaders.staffDashboard);
const StaffInventory = lazy(pageLoaders.staffInventory);
const StaffOrders = lazy(pageLoaders.staffOrders);
const StaffAppointments = lazy(pageLoaders.staffAppointments);

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
  useEffect(() => {
    warmPublicData();
  }, []);

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
