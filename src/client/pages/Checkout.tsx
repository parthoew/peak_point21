import React, { useState } from 'react';
import { useCart } from '../../shared/store/useCart';
import { useAuth } from '../../shared/store/useAuth';
import { formatPrice, cn } from '../../shared/utils';
import { db } from '../../shared/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Wallet, CheckCircle2, Phone, Mail, User as UserIcon, MapPin, ChevronDown, Plus, Trash2, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendNotification } from '../../shared/services/notificationService';

export default function Checkout() {
  const { items, total, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    division: '',
    note: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        subtotal: total(),
        vat: 0,
        deliveryCharge: 70,
        total: total() + 70,
        status: 'pending',
        paymentMethod,
        shippingAddress: formData,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Send notification
      await sendNotification({
        userId: user.uid,
        orderId: docRef.id,
        type: 'order_confirmation',
        message: `Your order #PP-${docRef.id.slice(0, 8).toUpperCase()} has been placed successfully.`,
      });

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
        <h1 className="text-4xl font-bold tracking-tighter mb-4 uppercase">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-12">Thank you for shopping with Peak Point. We'll contact you once the order is confirmed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-900 transition-all"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  const divisions = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tighter mb-12 text-blue-600">Place order</h1>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Contact Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone number <span className="text-red-500">*</span></label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <img src="https://flagcdn.com/w20/bd.png" alt="BD" className="w-5 h-3.5" />
                  <span className="text-sm font-medium">(+880)</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="flex-1 p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address (Optional)"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </section>

        {/* Personal Info Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Personal Info</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <input
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address <span className="text-red-500">*</span></label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select division</label>
              <div className="relative">
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select division</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Payment options</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'cod', name: 'Cash on delivery', icon: 'https://cdn-icons-png.flaticon.com/512/1554/1554401.png' },
              { id: 'bkash', name: 'bKash', icon: 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg' },
              { id: 'nagad', name: 'Nagad', icon: 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png' },
              { id: 'rocket', name: 'Rocket', icon: 'https://www.logo.wine/a/logo/Dutch-Bangla_Bank/Dutch-Bangla_Bank-Logo.wine.svg' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "px-6 py-3 rounded-full border-2 transition-all flex items-center space-x-3",
                  paymentMethod === method.id ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 hover:border-gray-300"
                )}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <img src={method.icon} alt={method.name} className="w-6 h-6 object-contain" />
                </div>
                <span className="text-sm font-bold">{method.name}</span>
                {paymentMethod === method.id && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="bg-red-50 p-4 rounded-xl text-red-500 text-sm font-medium">
            Note: We'll contact you once the order is confirmed
          </div>
        </section>

        {/* Cart Summary */}
        <section className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color || ''}-${item.material || ''}`} className="flex space-x-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>Size: {item.size}</span>
                          {item.color && <span>Color: {item.color}</span>}
                          {item.material && <span>Material: {item.material}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 line-through text-xs">{formatPrice(item.price * 1.2)}</p>
                        <p className="font-bold">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.color, item.material)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-bold text-sm">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.color, item.material)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem(item.id, item.size, item.color, item.material)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => navigate('/shop')}
              className="flex items-center space-x-2 text-blue-600 font-bold text-sm"
            >
              <Plus size={18} />
              <span>Add more items</span>
            </button>

            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex space-x-4">
                <input
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="button" className="px-8 py-4 bg-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-300 transition-all">
                  Apply
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sub Total</span>
                  <span className="text-black font-bold">{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>VAT/TAX (0%)</span>
                  <span className="text-black font-bold">0 BDT</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery charge <span className="text-red-500">(Non-refundable)</span></span>
                  <span className="text-black font-bold">70 BDT</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold">{formatPrice(total() + 70)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add Note Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Add note</h2>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Add your delivery instructions"
            rows={4}
            className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
        </section>

        <button
          disabled={loading || items.length === 0}
          type="submit"
          className="w-full bg-black text-white py-6 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <span>PLACE ORDER</span>
          )}
        </button>
      </form>
    </div>
  );
}
