import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { formatPrice, cn } from '../../lib/utils';
import { Plus, Trash2, Edit2, Search, Filter, X, Upload, Package, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Men',
    stock: '',
    description: '',
    images: [] as string[],
    sizes: ['S', 'M', 'L', 'XL']
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'products'), productData);
      setIsModalOpen(false);
      setFormData({ name: '', price: '', category: 'Men', stock: '', description: '', images: [], sizes: ['S', 'M', 'L', 'XL'] });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen pt-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">PRODUCT MANAGEMENT</h1>
          <p className="text-gray-500">Manage your inventory and catalog.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-gray-900 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="flex space-x-4">
            <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Filter size={20} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                      <div className="h-4 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-12" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 rounded w-24" /></td>
                  </tr>
                ))
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-bold">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold">{formatPrice(product.price)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
                      )} />
                      <span className="text-sm font-bold">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-black transition-colors"><Edit2 size={18} /></button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tighter uppercase">ADD NEW PRODUCT</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    >
                      <option>Men</option>
                      <option>Women</option>
                      <option>Accessories</option>
                      <option>New Arrivals</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price (BDT)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Images</label>
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all group">
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent" />
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black mt-2">Upload</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3"
                >
                  <CheckCircle2 size={20} />
                  <span>SAVE PRODUCT</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
