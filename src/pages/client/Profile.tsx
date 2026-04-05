import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { auth, db } from '../../firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { formatPrice } from '../../lib/utils';
import { LogOut, Package, MapPin, User as UserIcon, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not create
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      
      setUser(user, userSnap.exists() ? userSnap.data()?.role === 'admin' : false);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null, false);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
          <UserIcon size={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter mb-4">MY ACCOUNT</h1>
        <p className="text-gray-500 mb-12">Login to view your orders and manage your profile.</p>
        <button
          onClick={handleLogin}
          className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 mx-auto"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>CONTINUE WITH GOOGLE</span>
        </button>
      </div>
    );
  }

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
              {orders.map((order) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/shop')} className="mt-4 text-black font-bold border-b-2 border-black pb-1">START SHOPPING</button>
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
