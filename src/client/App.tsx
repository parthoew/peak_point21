import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../shared/firebase';
import { useAuth } from '../shared/store/useAuth';
import { useWishlist } from '../shared/store/useWishlist';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useCompare } from '../shared/store/useCompare';
import { BarChart2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Compare from './pages/Compare';

export default function ClientApp() {
  const { setUser, setLoading } = useAuth();
  const { syncWishlist, clearWishlist } = useWishlist();
  const { items: compareItems, removeItem: removeFromCompare } = useCompare();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        setUser(user, isAdmin);
        await syncWishlist(user.uid);
      } else {
        setUser(null, false);
        clearWishlist();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Floating Compare Button */}
        <AnimatePresence>
          {compareItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 flex items-center space-x-6"
            >
              <div className="flex -space-x-3">
                {compareItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="h-8 w-[1px] bg-gray-100" />
              <Link
                to="/compare"
                className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center space-x-2"
              >
                <BarChart2 size={16} />
                <span>COMPARE ({compareItems.length})</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
