import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../shared/firebase';
import { Save, Globe, Phone, Mail, MapPin, Instagram, Facebook, Twitter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    contact: {
      email: 'support@peakpoint.com',
      phone: '+880 1234 567890',
      address: 'House 123, Road 45, Sector 7, Uttara, Dhaka, Bangladesh'
    },
    social: {
      instagram: 'https://instagram.com/peakpoint',
      facebook: 'https://facebook.com/peakpoint',
      twitter: 'https://twitter.com/peakpoint'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen pt-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">SITE SETTINGS</h1>
          <p className="text-gray-500">Manage your website's contact info and social links.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-8">
        {/* Contact Information */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <Globe className="text-black" size={24} />
            <h2 className="text-xl font-bold tracking-tight uppercase">CONTACT INFORMATION</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <Mail size={12} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <Phone size={12} />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <MapPin size={12} />
                <span>Office Address</span>
              </label>
              <textarea
                rows={3}
                value={settings.contact.address}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <Instagram className="text-black" size={24} />
            <h2 className="text-xl font-bold tracking-tight uppercase">SOCIAL MEDIA LINKS</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <Instagram size={12} />
                <span>Instagram URL</span>
              </label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <Facebook size={12} />
                <span>Facebook URL</span>
              </label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-2">
                <Twitter size={12} />
                <span>Twitter URL</span>
              </label>
              <input
                type="url"
                value={settings.social.twitter}
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, twitter: e.target.value } })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all flex items-center space-x-3 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Save size={20} />
            )}
            <span>SAVE SETTINGS</span>
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-2 text-green-600 font-bold text-sm"
              >
                <CheckCircle2 size={18} />
                <span>Settings saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
