import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDestinations from './pages/admin/ManageDestinations';
import ManageAdmins from './pages/admin/ManageAdmins';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import { AboutUs, Blog, Contact, FAQ, HowToOrder, Terms, Privacy, Refund } from './pages/StaticPages';

// Dynamic Title component
const DynamicTitle = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    const path = location.pathname;
    let title = 'Wisata App'; // Default title
    
    if (path === '/') title = 'Home | Wisata App';
    else if (path.startsWith('/destinations')) title = 'Destinations | Wisata App';
    else if (path === '/cart') title = 'Shopping Cart | Wisata App';
    else if (path === '/checkout') title = 'Checkout | Wisata App';
    else if (path === '/profile') title = 'My Profile | Wisata App';
    else if (path === '/login') title = 'Login | Wisata App';
    else if (path === '/register') title = 'Register | Wisata App';
    else if (path.startsWith('/admin')) title = 'Admin Dashboard | Wisata App';
    else if (path === '/about-us') title = 'About Us | Wisata App';
    else if (path === '/blog') title = 'Blog | Wisata App';
    else if (path === '/contact-us') title = 'Contact Us | Wisata App';
    else if (path === '/faq') title = 'FAQ | Wisata App';
    else if (path === '/how-to-order') title = 'How to Order | Wisata App';
    
    document.title = title;
  }, [location]);

  return null;
};

// Role Guard for User Routes
const UserRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    
    // If logged in user is admin, superadmin, or owner, redirect to admin panel
    if (user && ['admin', 'superadmin', 'owner'].includes(user.role)) {
        return <Navigate to="/admin" replace />;
    }
    
    return children;
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <DynamicTitle />
      <Toaster position="top-right" />
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserRoute><Landing /></UserRoute>} />
          <Route path="/login" element={<UserRoute><Login /></UserRoute>} />
          <Route path="/register" element={<UserRoute><Register /></UserRoute>} />
          <Route path="/destinations" element={<UserRoute><Destinations /></UserRoute>} />
          <Route path="/destinations/:id" element={<UserRoute><DestinationDetail /></UserRoute>} />
          <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
          <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
          <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
          
          <Route path="/about-us" element={<UserRoute><AboutUs /></UserRoute>} />
          <Route path="/blog" element={<UserRoute><Blog /></UserRoute>} />
          <Route path="/contact-us" element={<UserRoute><Contact /></UserRoute>} />
          <Route path="/faq" element={<UserRoute><FAQ /></UserRoute>} />
          <Route path="/how-to-order" element={<UserRoute><HowToOrder /></UserRoute>} />
          <Route path="/terms" element={<UserRoute><Terms /></UserRoute>} />
          <Route path="/privacy" element={<UserRoute><Privacy /></UserRoute>} />
          <Route path="/refund" element={<UserRoute><Refund /></UserRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="destinations" element={<ManageDestinations />} />
            <Route path="users" element={<ManageAdmins />} />
          </Route>
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;

