import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatPrice, cn } from '../../lib/utils';
import { useCart } from '../../store/useCart';
import { ShoppingBag, Heart, ChevronRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../../components/ui/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProduct({ id: snapshot.id, ...data });
          
          // Fetch related
          const q = query(
            collection(db, 'products'),
            where('category', '==', data.category),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          setRelatedProducts(relatedSnap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found.</div>;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      size: selectedSize,
    });
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-gray-400 uppercase tracking-widest mb-12">
        <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate('/shop')} className="hover:text-black">Shop</button>
        <ChevronRight size={12} />
        <span className="text-black font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  activeImage === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-xs text-gray-500 font-bold">(48 Reviews)</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description || "Experience the pinnacle of luxury with our premium collection. Crafted with meticulous attention to detail and the finest materials, this piece embodies the essence of Peak Point's commitment to excellence."}
          </p>

          {/* Size Selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest">Select Size</h3>
              <button className="text-xs text-gray-400 underline hover:text-black">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-14 h-14 rounded-xl border-2 font-bold transition-all flex items-center justify-center",
                    selectedSize === size ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-grow bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3"
            >
              <ShoppingBag size={20} />
              <span>ADD TO CART</span>
            </button>
            <button className="p-5 border-2 border-gray-100 rounded-2xl hover:border-black transition-all">
              <Heart size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><Truck size={20} /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><RotateCcw size={20} /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">7 Day Return</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><ShieldCheck size={20} /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-12">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
