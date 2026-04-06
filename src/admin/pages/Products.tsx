import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { db, storage } from '../../shared/firebase';
import { formatPrice, cn } from '../../shared/utils';
import { Plus, Trash2, Edit2, Search, Filter, X, Upload, Package, CheckCircle2, GripVertical, AlertTriangle, Layers } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { sendNotification } from '../../shared/services/notificationService';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  material: string;
  stock: number;
  price?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Men',
    stock: '',
    description: '',
    images: [] as string[],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [] as ProductVariant[]
  });

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Math.random().toString(36).substr(2, 9),
      size: 'M',
      color: '',
      material: '',
      stock: 0,
      price: undefined
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, ...updates } : v)
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setProducts(productsData);
      
      // Check for low stock items (e.g., < 5)
      const lowStockItems = productsData.filter((p: any) => p.stock < 5);
      if (lowStockItems.length > 0) {
        // In a real app, we might want to throttle these notifications
        // For now, we'll just log it to our notification service
        for (const item of lowStockItems) {
          await sendNotification({
            type: 'low_stock',
            message: `Low stock alert: ${item.name} only has ${item.stock} units left.`,
            productId: item.id
          });
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const files = Array.from(e.target.files) as File[];
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const uploadPromises = files.map(async (file) => {
        // Compress image
        const compressedFile = await imageCompression(file, options);
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, compressedFile);
        return getDownloadURL(storageRef);
      });
      
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http')) {
      alert('Please enter a valid URL starting with http or https');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: formData.variants.length > 0 
          ? formData.variants.reduce((acc, v) => acc + v.stock, 0)
          : parseInt(formData.stock),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ 
        name: '', 
        price: '', 
        originalPrice: '',
        category: 'Men', 
        stock: '', 
        description: '', 
        images: [], 
        sizes: ['S', 'M', 'L', 'XL'],
        variants: []
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || 'Men',
      stock: product.stock?.toString() || '',
      description: product.description || '',
      images: product.images || [],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      variants: product.variants || []
    });
    setIsModalOpen(true);
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

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkStockUpdate = async () => {
    if (!bulkStockValue || isBulkUpdating) return;
    setIsBulkUpdating(true);
    try {
      const stock = parseInt(bulkStockValue);
      const promises = Array.from(selectedProducts).map((id: string) => 
        updateDoc(doc(db, 'products', id), { stock })
      );
      await Promise.all(promises);
      setIsBulkEditOpen(false);
      setBulkStockValue('');
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen pt-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">PRODUCT MANAGEMENT</h1>
          <p className="text-gray-500">Manage your inventory and catalog.</p>
        </div>
        <div className="flex space-x-4">
          <AnimatePresence>
            {selectedProducts.size > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setIsBulkEditOpen(true)}
                className="bg-white text-black border border-gray-200 px-8 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <Edit2 size={18} />
                <span>BULK EDIT STOCK ({selectedProducts.size})</span>
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ 
                name: '', 
                price: '', 
                originalPrice: '',
                category: 'Men', 
                stock: '', 
                description: '', 
                images: [], 
                sizes: ['S', 'M', 'L', 'XL'],
                variants: []
              });
              setIsModalOpen(true);
            }}
            className="bg-black text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-gray-900 transition-all flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>ADD NEW PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-4">
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer"
              >
                {['All', 'Men', 'Women', 'Accessories', 'New Arrivals'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"
              title="Reset Filters"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                </th>
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
                    <td className="px-8 py-6"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
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
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className={cn(
                  "hover:bg-gray-50 transition-colors",
                  selectedProducts.has(product.id) && "bg-black/[0.02]"
                )}>
                  <td className="px-8 py-6">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                  </td>
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
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
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

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {isBulkEditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkEditOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tighter uppercase">BULK EDIT STOCK</h2>
                <button onClick={() => setIsBulkEditOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-sm text-gray-500">
                  Update stock levels for {selectedProducts.size} selected products.
                </p>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Stock Quantity</label>
                  <input
                    type="number"
                    value={bulkStockValue}
                    onChange={(e) => setBulkStockValue(e.target.value)}
                    placeholder="Enter quantity..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <button
                  onClick={handleBulkStockUpdate}
                  disabled={isBulkUpdating || !bulkStockValue}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  <span>UPDATE STOCK</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ 
                  name: '', 
                  price: '', 
                  originalPrice: '',
                  category: 'Men', 
                  stock: '', 
                  description: '', 
                  images: [], 
                  sizes: ['S', 'M', 'L', 'XL'],
                  variants: []
                });
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tighter uppercase">
                  {editingId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                </h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ 
                      name: '', 
                      price: '', 
                      originalPrice: '',
                      category: 'Men', 
                      stock: '', 
                      description: '', 
                      images: [], 
                      sizes: ['S', 'M', 'L', 'XL'],
                      variants: []
                    });
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Price (BDT)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Past Price (Optional)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
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
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Variants</label>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-[10px] font-bold text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-all"
                    >
                      + ADD VARIANT
                    </button>
                  </div>

                  {formData.variants.length > 0 ? (
                    <div className="space-y-3">
                      {formData.variants.map((variant) => (
                        <div key={variant.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Variant Details</span>
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-gray-400">Size</label>
                              <select
                                value={variant.size}
                                onChange={(e) => updateVariant(variant.id, { size: e.target.value })}
                                className="w-full p-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none"
                              >
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-gray-400">Color</label>
                              <input
                                placeholder="e.g. Red"
                                value={variant.color}
                                onChange={(e) => updateVariant(variant.id, { color: e.target.value })}
                                className="w-full p-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-gray-400">Material</label>
                              <input
                                placeholder="e.g. Cotton"
                                value={variant.material}
                                onChange={(e) => updateVariant(variant.id, { material: e.target.value })}
                                className="w-full p-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-gray-400">Stock</label>
                              <input
                                type="number"
                                required
                                value={variant.stock}
                                onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold uppercase text-gray-400">Price (Opt)</label>
                              <input
                                type="number"
                                placeholder="Base"
                                value={variant.price || ''}
                                onChange={(e) => updateVariant(variant.id, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full p-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                      <Layers size={24} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-[10px] text-gray-400 uppercase font-bold">No variants added. Using base stock and price.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Images (Drag to reorder)</label>
                    <span className="text-[10px] font-bold text-gray-400">{formData.images.length} images</span>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={formData.images} 
                    onReorder={(newImages) => setFormData({ ...formData, images: newImages })}
                    className="space-y-3"
                  >
                    {formData.images.map((img, i) => (
                      <Reorder.Item 
                        key={img} 
                        value={img}
                        className="relative flex items-center space-x-4 p-3 bg-gray-50 border border-gray-100 rounded-xl group cursor-grab active:cursor-grabbing"
                      >
                        <div className="text-gray-400">
                          <GripVertical size={18} />
                        </div>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[10px] text-gray-400 truncate font-mono">{img.split('/').pop()?.split('?')[0]}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Add Image via URL</label>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Paste image URL here..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-grow p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-6 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-900 transition-all"
                      >
                        ADD URL
                      </button>
                    </div>
                  </div>

                  <label className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all group bg-gray-50/50">
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple />
                    {isUploading ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                          <Upload size={24} className="text-black" />
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest">Click or drag images to upload</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Supports multiple files</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center space-x-3"
                >
                  <CheckCircle2 size={20} />
                  <span>{editingId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
