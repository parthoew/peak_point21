import { useCart } from '../../store/useCart';
import { formatPrice } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter mb-4">YOUR CART IS EMPTY</h1>
        <p className="text-gray-500 mb-12">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-900 transition-all"
        >
          <span>CONTINUE SHOPPING</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tighter mb-12">SHOPPING CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <motion.div
              layout
              key={`${item.id}-${item.size}`}
              className="flex items-center space-x-6 pb-8 border-b border-gray-100"
            >
              <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Size: {item.size}</p>
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-3xl p-8 sticky top-32">
            <h2 className="text-xl font-bold tracking-tight mb-8">ORDER SUMMARY</h2>
            <div className="space-y-4 mb-8">
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
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3"
            >
              <span>CHECKOUT</span>
              <ArrowRight size={20} />
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest">
              Secure checkout powered by Peak Point
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
