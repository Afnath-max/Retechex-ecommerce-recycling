export const pageLoaders = {
  home: () => import('../pages/Home'),
  login: () => import('../pages/Login'),
  register: () => import('../pages/Register'),
  forgotPassword: () => import('../pages/ForgotPassword'),
  editProfile: () => import('../pages/EditProfile'),
  adminLogin: () => import('../pages/auth/AdminLogin'),
  staffLogin: () => import('../pages/auth/StaffLogin'),
  marketplace: () => import('../pages/Marketplace'),
  productDetails: () => import('../pages/ProductDetails'),
  cart: () => import('../pages/Cart'),
  checkout: () => import('../pages/Checkout'),
  myOrders: () => import('../pages/MyOrders'),
  orderDetails: () => import('../pages/OrderDetails'),
  myAppointments: () => import('../pages/MyAppointments'),
  bookAppointment: () => import('../pages/BookAppointment'),
  wishlist: () => import('../pages/Wishlist'),
  contact: () => import('../pages/ContactUs'),
  adminDashboard: () => import('../pages/admin/AdminDashboard'),
  adminProducts: () => import('../pages/admin/AdminProducts'),
  adminOrders: () => import('../pages/admin/AdminOrders'),
  adminAppointments: () => import('../pages/admin/AdminAppointments'),
  adminUsers: () => import('../pages/admin/AdminUsers'),
  adminDiscounts: () => import('../pages/admin/AdminDiscounts'),
  adminContactMessages: () => import('../pages/admin/ContactMessages'),
  staffDashboard: () => import('../pages/staff/StaffDashboard'),
  staffInventory: () => import('../pages/staff/StaffInventory'),
  staffOrders: () => import('../pages/staff/StaffOrders'),
  staffAppointments: () => import('../pages/staff/StaffAppointments'),
};

const routeToLoader = new Map([
  ['/', pageLoaders.home],
  ['/login', pageLoaders.login],
  ['/register', pageLoaders.register],
  ['/forgot-password', pageLoaders.forgotPassword],
  ['/edit-profile', pageLoaders.editProfile],
  ['/admin/login', pageLoaders.adminLogin],
  ['/staff/login', pageLoaders.staffLogin],
  ['/marketplace', pageLoaders.marketplace],
  ['/cart', pageLoaders.cart],
  ['/checkout', pageLoaders.checkout],
  ['/my-orders', pageLoaders.myOrders],
  ['/my-appointments', pageLoaders.myAppointments],
  ['/book-appointment', pageLoaders.bookAppointment],
  ['/wishlist', pageLoaders.wishlist],
  ['/contact', pageLoaders.contact],
  ['/admin/dashboard', pageLoaders.adminDashboard],
  ['/admin/products', pageLoaders.adminProducts],
  ['/admin/orders', pageLoaders.adminOrders],
  ['/admin/appointments', pageLoaders.adminAppointments],
  ['/admin/users', pageLoaders.adminUsers],
  ['/admin/discounts', pageLoaders.adminDiscounts],
  ['/admin/contact-messages', pageLoaders.adminContactMessages],
  ['/staff/dashboard', pageLoaders.staffDashboard],
  ['/staff/inventory', pageLoaders.staffInventory],
  ['/staff/orders', pageLoaders.staffOrders],
  ['/staff/appointments', pageLoaders.staffAppointments],
]);

export function preloadRoute(pathname) {
  const loader = routeToLoader.get(pathname);
  if (loader) loader();
}

export function preloadDashboardRoute({ isAdmin, isStaff } = {}) {
  if (isAdmin) preloadRoute('/admin/dashboard');
  else if (isStaff) preloadRoute('/staff/dashboard');
  else preloadRoute('/my-orders');
}
