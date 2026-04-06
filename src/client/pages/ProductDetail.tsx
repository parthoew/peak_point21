import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, limit, getDocs, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../shared/firebase';
import { formatPrice, cn } from '../../shared/utils';
import { useCart } from '../../shared/store/useCart';
import { useWishlist } from '../../shared/store/useWishlist';
import { useAuth } from '../../shared/store/useAuth';
import { useCompare } from '../../shared/store/useCompare';
import { ShoppingBag, Heart, ChevronRight, Star, ShieldCheck, Truck, RotateCcw, MessageSquare, User as UserIcon, CheckCircle2, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../../shared/components/ui/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompare();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isWishlisted = product && wishlistItems.includes(product.id);
  const isCompared = product && isInCompare(product.id);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCompare = () => {
    if (!product) return;
    if (isCompared) {
      removeFromCompare(product.id);
      showToast('Removed from comparison');
    } else {
      addToCompare({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        stock: product.stock,
        variants: product.variants
      });
      showToast('Added to comparison');
    }
  };

  // Find matching variant
  const currentVariant = product?.variants?.find((v: any) => 
    v.size === selectedSize && 
    (selectedColor ? v.color === selectedColor : true) &&
    (selectedMaterial ? v.material === selectedMaterial : true)
  );

  const displayPrice = currentVariant?.price || product?.price;
  const displayStock = currentVariant ? currentVariant.stock : product?.stock;

  // Get unique colors and materials for the selected size
  const availableColors = Array.from(new Set(product?.variants?.filter((v: any) => v.size === selectedSize).map((v: any) => v.color).filter(Boolean)));
  const availableMaterials = Array.from(new Set(product?.variants?.filter((v: any) => v.size === selectedSize && (!selectedColor || v.color === selectedColor)).map((v: any) => v.material).filter(Boolean)));

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedSize(first.size);
      setSelectedColor(first.color || '');
      setSelectedMaterial(first.material || '');
    }
  }, [product]);

  const handleWishlist = async () => {
    if (!user) {
      showToast('Please login to add items to your wishlist.', 'error');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(user.uid, product.id);
      showToast('Removed from wishlist');
    } else {
      await addToWishlist(user.uid, product.id);
      showToast('Added to wishlist');
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!user || !id) return;
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        where('status', '==', 'delivered')
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => doc.data());
      const purchased = orders.some(order => 
        order.items.some((item: any) => item.id === id)
      );
      setHasPurchased(purchased);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

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
          
          fetchReviews();
          checkPurchaseStatus();
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        productId: id,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp()
      });
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found.</div>;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const handleAddToCart = () => {
    if (displayStock <= 0) {
      showToast('This variant is out of stock.', 'error');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.images[0],
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      material: selectedMaterial,
      variantId: currentVariant?.id
    });
    showToast('Added to cart');
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
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                    className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-bold">({reviews.length} Reviews)</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">{product.name}</h1>
            <div className="flex items-baseline space-x-4">
              <p className="text-2xl font-bold text-gray-900">{formatPrice(displayPrice)}</p>
              {product.originalPrice && product.originalPrice > displayPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-400 line-through font-bold">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    -{Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
              {displayStock <= 5 && displayStock > 0 && (
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Only {displayStock} left!</span>
              )}
              {displayStock === 0 && (
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Out of Stock</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description || "Experience the pinnacle of luxury with our premium collection. Crafted with meticulous attention to detail and the finest materials, this piece embodies the essence of Peak Point's commitment to excellence."}
          </p>

          {/* Variant Selectors */}
          <div className="space-y-6">
            {/* Size Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest">Select Size</h3>
                <button className="text-xs text-gray-400 underline hover:text-black">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(product.variants?.length > 0 ? Array.from(new Set(product.variants.map((v: any) => v.size))) : product.sizes || ['S', 'M', 'L', 'XL']).map((size: any) => (
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

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-6 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center uppercase text-[10px] tracking-widest",
                        selectedColor === color ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Selector */}
            {availableMaterials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest">Select Material</h3>
                <div className="flex flex-wrap gap-3">
                  {availableMaterials.map((material: any) => (
                    <button
                      key={material}
                      onClick={() => setSelectedMaterial(material)}
                      className={cn(
                        "px-6 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center uppercase text-[10px] tracking-widest",
                        selectedMaterial === material ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-300"
                      )}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            <button
              onClick={handleWishlist}
              className={cn(
                "p-5 border-2 rounded-2xl transition-all",
                isWishlisted ? "bg-red-500 border-red-500 text-white" : "border-gray-100 hover:border-black"
              )}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleCompare}
              className={cn(
                "p-5 border-2 rounded-2xl transition-all",
                isCompared ? "bg-blue-500 border-blue-500 text-white" : "border-gray-100 hover:border-black"
              )}
            >
              <BarChart2 size={20} />
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

      {/* Reviews Section */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Customer Reviews</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                    className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-lg font-bold">{averageRating.toFixed(1)} out of 5</span>
              <span className="text-gray-400">({reviews.length} reviews)</span>
            </div>
          </div>
          {user && hasPurchased && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition-all flex items-center space-x-2"
            >
              <MessageSquare size={18} />
              <span>WRITE A REVIEW</span>
            </button>
          )}
          {user && !hasPurchased && (
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-100 px-4 py-2 rounded-full">
              Purchase this item to leave a review
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-8 bg-gray-50 rounded-3xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {review.userPhoto ? (
                        <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{review.userName}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">
                        {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < review.rating ? "currentColor" : "none"} 
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tighter uppercase">Write a Review</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronRight size={24} className="rotate-90" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star 
                          size={32} 
                          fill={star <= reviewForm.rating ? "currentColor" : "none"} 
                          className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Experience</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell us what you think about this product..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                  />
                </div>

                <button
                  disabled={isSubmittingReview}
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <span>SUBMIT REVIEW</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tighter mb-12">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm tracking-widest uppercase flex items-center space-x-3",
              toast.type === 'success' ? "bg-black text-white" : "bg-red-500 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
