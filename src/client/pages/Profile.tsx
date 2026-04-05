import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/store/useAuth';
import { useWishlist } from '../../shared/store/useWishlist';
import { auth, db } from '../../shared/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { formatPrice, cn } from '../../shared/utils';
import { LogOut, Package, MapPin, User as UserIcon, ChevronRight, ShoppingBag, Heart, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../shared/components/ui/ProductCard';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { items: wishlistIds, syncWishlist } = useWishlist();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch Orders
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Sync wishlist from Firestore
        await syncWishlist(user.uid);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }
      setWishlistLoading(true);
      try {
        const productsRef = collection(db, 'products');
        if (wishlistIds.length <= 10) {
          const q = query(productsRef, where('__name__', 'in', wishlistIds));
          const snap = await getDocs(q);
          setWishlistProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const promises = wishlistIds.map(id => getDoc(doc(db, 'products', id)));
          const snaps = await Promise.all(promises);
          setWishlistProducts(snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() })));
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        
        // Create user doc in Firestore
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: displayName,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        
        setUser(result.user, false);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        setUser(result.user, userSnap.exists() ? userSnap.data()?.role === 'admin' : false);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null, false);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="pt-40 pb-20 px-6 max-w-xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserIcon size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">
              {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isSignUp ? 'Join Peak Point for a premium experience' : 'Login to manage your profile and orders'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={authLoading}
              type="submit"
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />
              )}
              <span>{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
              }}
              className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
            >
              {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered'];

  const getStatusIndex = (status: string) => {
    return orderStatuses.indexOf(status.toLowerCase());
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-16 space-y-8 md:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">{user.displayName}</h1>
            <p className="text-gray-500 font-medium">{user.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-gray-50 p-6 rounded-2xl text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Orders</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl text-center">
            <p className="text-2xl font-bold">{formatPrice(orders.reduce((acc, o) => acc + o.total, 0))}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Order History */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-bold tracking-tight mb-8 flex items-center space-x-3">
            <Package size={20} />
            <span>ORDER HISTORY</span>
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStatusIndex = getStatusIndex(order.status);
                return (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order #PP-{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={cn(
                        "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        order.status === 'delivered' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {order.status}
                      </span>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-8 px-2">
                      <div className="relative flex justify-between items-center">
                        {/* Connecting Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10" />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-black transition-all duration-500 -z-10" 
                          style={{ width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
                        />
                        
                        {orderStatuses.map((status, index) => (
                          <div key={status} className="flex flex-col items-center">
                            <div className={cn(
                              "w-3 h-3 rounded-full transition-all duration-500",
                              index <= currentStatusIndex ? "bg-black scale-125" : "bg-gray-200"
                            )} />
                            <span className={cn(
                              "text-[8px] font-bold uppercase tracking-widest mt-2 transition-colors duration-500",
                              index <= currentStatusIndex ? "text-black" : "text-gray-300"
                            )}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-gray-100">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                        <button className="text-xs font-bold text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/shop')} className="mt-4 text-black font-bold border-b-2 border-black pb-1">START SHOPPING</button>
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-bold tracking-tight mb-8 flex items-center space-x-3">
            <Heart size={20} />
            <span>MY WISHLIST</span>
          </h2>

          {wishlistLoading ? (
            <div className="grid grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <Heart size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">Your wishlist is empty.</p>
              <button onClick={() => navigate('/shop')} className="mt-4 text-black font-bold border-b-2 border-black pb-1">BROWSE PRODUCTS</button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-50 rounded-3xl p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center space-x-2">
              <MapPin size={16} />
              <span>Default Address</span>
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <p className="font-bold text-black">{user.displayName}</p>
              <p>Gulshan 2, Dhaka, Bangladesh</p>
              <p>Phone: +880 1234 567890</p>
              <button className="text-xs font-bold text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-all">
                Edit Address
              </button>
            </div>
          </div>

          <div className="bg-black text-white rounded-3xl p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Peak Rewards</h3>
            <p className="text-xs text-gray-400 mb-6">You have 250 Peak Points available for your next purchase.</p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-white h-full w-1/2" />
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span>Silver Member</span>
              <span>500 to Gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
