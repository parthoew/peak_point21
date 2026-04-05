import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../shared/firebase';
import { useAuth } from '../shared/store/useAuth';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '../shared/utils';

const AdminSidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 p-6 flex flex-col z-40">
      <div className="mb-10 px-4">
        <div className="flex flex-col -space-y-1">
          <span className="text-xl font-display font-bold tracking-tight text-black uppercase">PEAK POINT</span>
          <span className="text-[7px] font-display font-medium tracking-[0.3em] text-gray-400 uppercase">ADMIN PANEL</span>
        </div>
      </div>
      <div className="flex-grow space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              location.pathname === item.href 
                ? "bg-black text-white shadow-lg shadow-black/10" 
                : "text-gray-400 hover:bg-gray-50 hover:text-black"
            )}
          >
            <item.icon size={20} />
            <span>{item.name.toUpperCase()}</span>
          </Link>
        ))}
      </div>
      <button 
        onClick={() => auth.signOut()}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut size={20} />
        <span>LOGOUT</span>
      </button>
    </div>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function AdminApp() {
  const { setUser, setLoading } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        setUser(user, isAdmin);
      } else {
        setUser(null, false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <AdminRoute>
                <div className="flex w-full">
                  <AdminSidebar />
                  <div className="flex-grow ml-64">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </div>
                </div>
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
