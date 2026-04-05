import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Heart, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../../shared/store/useCart';
import { useWishlist } from '../../../shared/store/useWishlist';
import { useAuth } from '../../../shared/store/useAuth';
import { useCompare } from '../../../shared/store/useCompare';
import { cn } from '../../../shared/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const compareCount = compareItems.length;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'New Arrivals', href: '/shop?category=new' },
    { name: 'Collections', href: '/shop?category=collections' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6 py-3 md:py-4',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white md:bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group shrink-0">
          <img 
            src="https://image2url.com/r2/default/images/1775421148504-e3595f09-8c3e-4bb5-97d1-1eff6e90e6ca.png" 
            alt="Peak Point Icon" 
            className="h-8 w-8 md:h-14 md:w-14 aspect-square object-cover rounded-full border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col -space-y-1">
            <span className="text-base md:text-3xl font-display font-bold tracking-tight md:tracking-[0.15em] text-black uppercase">PEAK POINT</span>
            <span className="text-[7px] md:text-[10px] font-display font-medium tracking-widest md:tracking-[0.45em] text-gray-500 uppercase">BEYOND ORDINARY</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-sm font-medium tracking-wide hover:text-gray-500 transition-colors uppercase',
                location.pathname === link.href ? 'text-black' : 'text-gray-600'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center text-black">
          <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={18} className="md:w-5 md:h-5" />
          </button>
          <Link to="/profile" className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Heart size={20} className={cn(wishlistCount > 0 && "text-red-500 fill-red-500")} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/compare" className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <BarChart2 size={20} className={cn(compareCount > 0 && "text-blue-500")} />
            {compareCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {compareCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors">
            <User size={18} className="md:w-5 md:h-5" />
          </Link>
          <Link to="/cart" className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingBag size={18} className="md:w-5 md:h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-800 hover:text-black uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
