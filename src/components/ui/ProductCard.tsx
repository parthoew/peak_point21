import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../store/useCart';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      size: product.sizes?.[0] || 'M',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6 space-x-3">
          <button
            onClick={handleAddToCart}
            className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <ShoppingBag size={20} />
          </button>
          <button className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
            <Heart size={20} />
          </button>
        </div>
      </Link>

      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
