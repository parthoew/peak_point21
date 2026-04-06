import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../shared/utils';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGES[0]}
            alt="Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 uppercase tracking-[0.3em] text-sm mb-4"
          >
            Spring Summer 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white text-6xl md:text-8xl font-bold tracking-tighter mb-8"
          >
            ELEVATE YOUR <br /> STYLE
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/shop"
              className="bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all duration-500 flex items-center space-x-2 group"
            >
              <span>SHOP COLLECTION</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-[1px] h-12 bg-white/30 mx-auto" />
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter mb-2">CURATED COLLECTIONS</h2>
            <p className="text-gray-500">Handpicked styles for the modern individual.</p>
          </div>
          <Link to="/shop" className="text-sm font-bold border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Men's Premium", category: "Men", img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop', span: 'md:col-span-2' },
            { name: "Women's Elite", category: "Women", img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', span: '' },
            { name: "Accessories", category: "Accessories", img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', span: '' },
            { name: "New Arrivals", category: "New Arrivals", img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', span: 'md:col-span-2' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/shop?category=${cat.category}`)}
              className={cn("relative h-[400px] overflow-hidden group cursor-pointer rounded-2xl", cat.span)}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white text-2xl font-bold tracking-tight mb-2">{cat.name}</h3>
                <span className="text-white/80 text-sm font-medium border-b border-white/50 pb-1">EXPLORE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center overflow-hidden border-4 border-white shadow-xl aspect-square"
          >
            <img 
              src="https://image2url.com/r2/default/images/1775421148504-e3595f09-8c3e-4bb5-97d1-1eff6e90e6ca.png" 
              alt="Peak Point Icon" 
              className="w-full h-full object-cover aspect-square"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tighter">THE PEAK POINT PHILOSOPHY</h2>
          <p className="text-xl text-gray-600 leading-relaxed font-light italic">
            "We believe that fashion is more than just clothing; it's an expression of one's inner self. 
            Peak Point was founded in Dhaka with a singular mission: to bring world-class luxury and 
            uncompromising quality to the fashion-forward people of Bangladesh."
          </p>
          <div className="pt-8">
            <Link to="/about" className="text-sm font-bold tracking-widest uppercase border-b-2 border-black pb-2">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
