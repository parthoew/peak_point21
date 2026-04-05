import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../firebase';
import ProductCard from '../../components/ui/ProductCard';
import { Filter, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        if (categoryParam && categoryParam !== 'all') {
          q = query(collection(db, 'products'), where('category', '==', categoryParam));
        }
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam]);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">
            {categoryParam ? `${categoryParam} Collection` : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-2">{products.length} items found</p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-2 border border-black rounded-full text-sm font-bold hover:bg-black hover:text-white transition-all"
          >
            <SlidersHorizontal size={18} />
            <span>FILTERS</span>
          </button>
        </div>
      </div>

      {/* Filters Drawer (Simplified for now) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12 border-b border-gray-100"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Category</h3>
                <div className="space-y-2">
                  {['All', 'Men', 'Women', 'Accessories'].map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                      <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-black transition-colors" />
                      <span className="text-sm text-gray-600 group-hover:text-black">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button key={size} className="w-10 h-10 border border-gray-200 rounded-lg text-xs font-bold hover:border-black transition-all">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Price Range</h3>
                <input type="range" className="w-full accent-black" min="0" max="10000" />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0 BDT</span>
                  <span>10,000 BDT</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Sort By</h3>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popularity</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[4/5] bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-400">No products found in this category.</h3>
          <button className="mt-4 text-black font-bold border-b-2 border-black pb-1">BROWSE ALL</button>
        </div>
      )}
    </div>
  );
}
