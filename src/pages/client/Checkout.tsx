import React, { useState } from 'react';
import { useCart } from '../../store/useCart';
import { useAuth } from '../../store/useAuth';
import { formatPrice, cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Dhaka',
    area: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to place an order');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items,
        total: total(),
        status: 'pending',
        paymentMethod,
        shippingAddress: formData,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'orders'), orderData);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tighter mb-4">ORDER PLACED SUCCESSFULLY!</h1>
        <p className="text-gray-500 mb-12">Thank you for shopping with Peak Point. Your order ID is #PP-{Math.floor(Math.random() * 100000)}.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-900 transition-all"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tighter mb-12">CHECKOUT</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Shipping Info */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-8 flex items-center space-x-3">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">1</div>
              <span>SHIPPING INFORMATION</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">First Name</label>
                <input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+880"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Delivery Address</label>
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                >
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                  <option>Rajshahi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Area</label>
                <input
                  required
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold tracking-tight mb-8 flex items-center space-x-3">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">2</div>
              <span>PAYMENT METHOD</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'cod', name: 'Cash on Delivery', icon: <Truck size={20} /> },
                { id: 'bkash', name: 'bKash', icon: <Wallet size={20} /> },
                { id: 'nagad', name: 'Nagad', icon: <CreditCard size={20} /> },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-3",
                    paymentMethod === method.id ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  {method.icon}
                  <span className="text-xs font-bold uppercase tracking-widest">{method.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-3xl p-8 sticky top-32">
            <h2 className="text-xl font-bold tracking-tight mb-8">YOUR ORDER</h2>
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity} | {item.size}</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 mb-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-bold uppercase tracking-wider">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold">{formatPrice(total())}</span>
              </div>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
            <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-gray-400 uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Secure Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
