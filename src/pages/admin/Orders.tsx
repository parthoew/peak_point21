import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice, cn } from '../../lib/utils';
import { Search, Filter, Eye, ChevronRight, Clock, Truck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle2 size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle2 size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen pt-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">ORDER MANAGEMENT</h1>
          <p className="text-gray-500">Track and fulfill customer orders.</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pending Orders</p>
              <p className="text-xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Filter size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Items</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 rounded w-24" /></td>
                  </tr>
                ))
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold">#PP-{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                    <p className="text-xs text-gray-400">{order.shippingAddress?.email}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold">{order.items?.length} items</td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      order.status === 'delivered' ? "bg-green-50 text-green-600" : 
                      order.status === 'pending' ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"
                    )}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold">{formatPrice(order.total)}</td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-2 text-xs font-bold text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-all"
                    >
                      <Eye size={14} />
                      <span>DETAILS</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
            >
              {/* Left: Order Info */}
              <div className="flex-grow p-10 overflow-y-auto space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tighter uppercase">ORDER #PP-{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                      Placed on {new Date(selectedOrder.createdAt?.toDate?.() || selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">Items Ordered</h3>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center space-x-6">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-gray-100">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Shipping Address</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-bold">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.area}, {selectedOrder.shippingAddress?.city}</p>
                      <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Payment Details</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-bold uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                      <p className="text-gray-500">Status: {selectedOrder.status === 'delivered' ? 'Paid' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="w-full md:w-80 bg-gray-50 p-10 border-l border-gray-100 space-y-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Status</h3>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className={cn(
                        "w-full p-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between",
                        selectedOrder.status === status ? "bg-black text-white" : "bg-white border border-gray-100 hover:border-black"
                      )}
                    >
                      <span>{status}</span>
                      {selectedOrder.status === status && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-bold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-6">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-bold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                <button className="w-full bg-white border border-gray-200 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-black transition-all">
                  Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
