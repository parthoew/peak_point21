import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../../shared/firebase';
import ProductCard from '../../shared/components/ui/ProductCard';
import { Filter, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../shared/utils';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

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

  const sortedProducts = [...products]
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popularity':
          return (b.sales || 0) - (a.sales || 0);
        case 'newest':
        default:
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
      }
    });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">
            {categoryParam ? `${categoryParam} Collection` : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-2">{sortedProducts.length} items found</p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    <button 
                      key={cat} 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        if (cat === 'All') params.delete('category');
                        else params.set('category', cat);
                        navigate(`/shop?${params.toString()}`);
                      }}
                      className="flex items-center space-x-2 cursor-pointer group w-full text-left"
                    >
                      <div className={cn(
                        "w-4 h-4 border rounded transition-colors",
                        (categoryParam === cat || (!categoryParam && cat === 'All')) 
                          ? "bg-black border-black" 
                          : "border-gray-300 group-hover:border-black"
                      )} />
                      <span className={cn(
                        "text-sm transition-colors",
                        (categoryParam === cat || (!categoryParam && cat === 'All'))
                          ? "text-black font-bold"
                          : "text-gray-600 group-hover:text-black"
                      )}>{cat}</span>
                    </button>
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
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
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
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-400">No products found.</h3>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSortBy('newest');
            }}
            className="mt-4 text-black font-bold border-b-2 border-black pb-1"
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
