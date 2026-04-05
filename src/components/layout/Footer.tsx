import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tighter">PEAK POINT</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Redefining luxury fashion in Bangladesh. Premium quality, timeless designs, and an
            unmatched shopping experience.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Shop</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/shop?category=men" className="hover:text-white transition-colors">Men's Collection</Link></li>
            <li><Link to="/shop?category=women" className="hover:text-white transition-colors">Women's Collection</Link></li>
            <li><Link to="/shop?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Support</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Contact</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-center space-x-3">
              <MapPin size={16} />
              <span>Gulshan 2, Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={16} />
              <span>+880 1234 567890</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={16} />
              <span>support@peakpoint.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Peak Point. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Paypal" className="h-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
        </div>
      </div>
    </footer>
  );
}
