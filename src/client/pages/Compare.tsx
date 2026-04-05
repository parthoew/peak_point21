import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowLeft, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../shared/store/useCompare';
import { useCart } from '../../shared/store/useCart';
import { formatPrice, cn } from '../../shared/utils';

export default function Compare() {
  const { items, removeItem, clearCompare } = useCompare();
  const { addItem: addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <BarChart2 size={40} className="text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter mb-4 uppercase">No products to compare</h1>
        <p className="text-gray-500 mb-12 max-w-md text-center">
          Add products to your comparison list to see their specifications side-by-side.
        </p>
        <Link
          to="/shop"
          className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>BACK TO SHOP</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Compare Products</h1>
          <p className="text-gray-500">Compare specifications of up to 4 products.</p>
        </div>
        <button
          onClick={clearCompare}
          className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-6 text-left border-b border-gray-100 bg-gray-50/50 w-48"></th>
              {items.map((product) => (
                <th key={product.id} className="p-6 border-b border-gray-100 min-w-[280px]">
                  <div className="relative group">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 hover:bg-red-500 hover:text-white transition-all z-10"
                    >
                      <X size={14} />
                    </button>
                    <Link to={`/product/${product.id}`} className="block mb-4 aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm font-bold text-gray-900 mb-4">{formatPrice(product.price)}</p>
                    <button
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                        size: 'M'
                      })}
                      className="w-full bg-black text-white py-3 rounded-full text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
                    >
                      <ShoppingBag size={14} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </th>
              ))}
              {/* Fill empty slots if less than 4 */}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <th key={`empty-${i}`} className="p-6 border-b border-gray-100 min-w-[280px]">
                  <div className="aspect-[4/5] rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 space-y-4">
                    <BarChart2 size={32} />
                    <Link to="/shop" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
                      Add Product
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="p-6 font-bold uppercase tracking-widest text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100">Category</td>
              {items.map(product => (
                <td key={product.id} className="p-6 border-b border-gray-100 capitalize">{product.category}</td>
              ))}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <td key={`empty-cat-${i}`} className="p-6 border-b border-gray-100"></td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold uppercase tracking-widest text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100">Availability</td>
              {items.map(product => (
                <td key={product.id} className="p-6 border-b border-gray-100">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">In Stock ({product.stock})</span>
                  ) : (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  )}
                </td>
              ))}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <td key={`empty-stock-${i}`} className="p-6 border-b border-gray-100"></td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold uppercase tracking-widest text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100">Variants</td>
              {items.map(product => (
                <td key={product.id} className="p-6 border-b border-gray-100">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-1">
                      <p className="font-medium">{product.variants.length} Variants available</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(product.variants.map((v: any) => v.color))).filter(Boolean).map((color: any) => (
                          <span key={color} className="px-2 py-0.5 bg-gray-100 rounded text-[10px] uppercase">{color}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Standard</span>
                  )}
                </td>
              ))}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <td key={`empty-variants-${i}`} className="p-6 border-b border-gray-100"></td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold uppercase tracking-widest text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100">Sizes</td>
              {items.map(product => (
                <td key={product.id} className="p-6 border-b border-gray-100">
                   {product.variants && product.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(product.variants.map((v: any) => v.size))).map((size: any) => (
                        <span key={size} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold">{size}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <span key={size} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold">{size}</span>
                      ))}
                    </div>
                  )}
                </td>
              ))}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <td key={`empty-sizes-${i}`} className="p-6 border-b border-gray-100"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
