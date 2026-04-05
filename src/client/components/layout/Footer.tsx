import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/firebase';

export default function Footer() {
  const [settings, setSettings] = useState({
    contact: {
      email: 'support@peakpoint.com',
      phone: '+880 1234 567890',
      address: 'Gulshan 2, Dhaka, Bangladesh'
    },
    social: {
      instagram: 'https://instagram.com/peakpoint',
      facebook: 'https://facebook.com/peakpoint',
      twitter: 'https://twitter.com/peakpoint'
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-black text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex flex-col space-y-4">
            <img 
              src="https://image2url.com/r2/default/images/1775421148504-e3595f09-8c3e-4bb5-97d1-1eff6e90e6ca.png" 
              alt="Peak Point Icon" 
              className="h-16 w-16 object-cover rounded-full border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col -space-y-1">
              <span className="text-3xl font-display font-bold tracking-[0.15em] text-white uppercase">PEAK POINT</span>
              <span className="text-[10px] font-display font-medium tracking-[0.45em] text-gray-400 uppercase ml-1">BEYOND ORDINARY</span>
            </div>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Redefining luxury fashion in Bangladesh. Premium quality, timeless designs, and an
            unmatched shopping experience.
          </p>
          <div className="flex space-x-4">
            <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
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
              <span>{settings.contact.address}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={16} />
              <span>{settings.contact.phone}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={16} />
              <span>{settings.contact.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Peak Point. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
