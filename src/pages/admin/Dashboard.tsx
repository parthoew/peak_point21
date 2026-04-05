import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice, cn } from '../../lib/utils';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));
        
        const totalRevenue = ordersSnap.docs.reduce((acc, doc) => acc + doc.data().total, 0);
        const recentOrders = ordersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          .slice(0, 5);

        setStats({
          totalRevenue,
          totalOrders: ordersSnap.size,
          totalUsers: usersSnap.size,
          recentOrders
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: <DollarSign />, trend: '+12.5%', isUp: true },
    { name: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag />, trend: '+8.2%', isUp: true },
    { name: 'Total Users', value: stats.totalUsers, icon: <Users />, trend: '+5.4%', isUp: true },
    { name: 'Conversion Rate', value: '3.2%', icon: <TrendingUp />, trend: '-1.1%', isUp: false },
  ];

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen pt-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">DASHBOARD OVERVIEW</h1>
          <p className="text-gray-500">Welcome back, Administrator.</p>
        </div>
        <div className="flex space-x-4">
          <button className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-sm font-bold hover:border-black transition-all">EXPORT REPORT</button>
          <Link to="/admin/products" className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all">ADD PRODUCT</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-black">{stat.icon}</div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                stat.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">RECENT ORDERS</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-black border-b border-black pb-0.5">VIEW ALL</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold">#PP-{order.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress?.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        order.status === 'delivered' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold">{formatPrice(order.total)}</td>
                    <td className="px-8 py-6 text-xs text-gray-400">
                      {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold tracking-tight mb-8">SYSTEM STATUS</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">Firebase Auth</p>
                    <p className="text-xs text-gray-400">Operational</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">Firestore DB</p>
                    <p className="text-xs text-gray-400">Operational</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">Cloud Storage</p>
                    <p className="text-xs text-gray-400">Operational</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-3xl shadow-sm p-8">
            <h2 className="text-xl font-bold tracking-tight mb-4">INVENTORY ALERT</h2>
            <p className="text-sm text-gray-400 mb-6">5 products are currently low on stock and need replenishment.</p>
            <Link to="/admin/products" className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-gray-100 transition-all">
              <Package size={18} />
              <span>MANAGE INVENTORY</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
