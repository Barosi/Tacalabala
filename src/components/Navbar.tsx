
import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, ShoppingBag, ChevronRight, Instagram, Mail } from 'lucide-react';
import { LOGO_URL, INSTAGRAM_URL } from '../constants';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface NavbarProps {
  currentPage: 'home' | 'store' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout' | 'product-details' | 'privacy' | 'terms';
  onNavigate: (page: 'home' | 'store' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout' | 'product-details' | 'privacy' | 'terms', hash?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, cart } = useStore();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const handleLinkClick = (page: any, hash?: string) => {
    onNavigate(page, hash);
    setIsMobileMenuOpen(false);
  };

  const getNavbarClasses = () => {
      const isCompact = isScrolled || currentPage !== 'home';

      if (isMobileMenuOpen) {
          return `bg-transparent border-transparent shadow-none py-1 md:py-4`; // Less padding on mobile open
      }
      
      if (isCompact) {
          return 'bg-white border-slate-200 shadow-sm py-1 md:py-4';
      }

      return 'bg-transparent border-transparent py-2 md:py-6';
  };

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const linkVariants: Variants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out border-b ${getNavbarClasses()}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        
        {/* Mobile Left: Menu Trigger */}
        <div className="md:hidden flex items-center">
             <button 
                className={`relative z-[60] p-2 -ml-2 rounded-full transition-colors ${isMobileMenuOpen ? 'text-slate-900 bg-slate-100' : 'text-slate-900 hover:bg-slate-50'}`} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>

        {/* Center Logo (Mobile) / Left Logo (Desktop) */}
        {/* LOGO RESIZED FOR MOBILE: h-28 (112px) to make it really stand out */}
        <button onClick={() => handleLinkClick('home')} className="relative z-50 focus:outline-none flex items-center justify-center transition-all duration-300">
             <img 
                src={LOGO_URL} 
                alt="Tacalabala Milano" 
                className="h-28 md:h-32 w-auto object-contain drop-shadow-md transition-all duration-300" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
             />
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-6 lg:gap-8 border-r border-slate-200 pr-6 lg:pr-8 mr-6 lg:mr-8 h-6">
            <button onClick={() => handleLinkClick('home')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Home <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'home' ? 'w-full' : ''}`}></span>
            </button>
            <button onClick={() => handleLinkClick('store')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Shop <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'store' ? 'w-full' : ''}`}></span>
            </button>
             <button onClick={() => handleLinkClick('chi-siamo')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Chi Siamo <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'chi-siamo' ? 'w-full' : ''}`}></span>
            </button>
            <button onClick={() => handleLinkClick('faq')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              FAQ <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'faq' ? 'w-full' : ''}`}></span>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleCart} className="relative p-2 text-slate-800 hover:text-[#0066b2] transition-colors group">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#0066b2] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white group-hover:scale-110 transition-transform">{cartCount}</span>}
            </button>
            <button onClick={() => handleLinkClick('admin')} className="p-2 text-slate-300 hover:text-slate-900 transition-colors" title="Area Riservata"><Lock size={22} /></button>
          </div>
        </div>

        {/* Mobile Right: Cart */}
        <div className="md:hidden flex items-center">
            <button onClick={toggleCart} className="relative p-2 -mr-2 text-slate-900 hover:text-[#0066b2] transition-colors active:scale-90 transform duration-150 z-50">
                <ShoppingBag size={28} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#0066b2] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
            </button>
        </div>
      </div>
      
      {/* PREMIUM MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div 
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
                className="fixed inset-0 bg-white/95 backdrop-blur-xl z-50 flex flex-col justify-between pt-36 pb-10 px-8 md:hidden"
            >
                {/* Menu Links */}
                <div className="flex flex-col space-y-6">
                    {[
                        { id: 'home', label: 'Home' },
                        { id: 'store', label: 'Shop' },
                        { id: 'chi-siamo', label: 'Chi Siamo' },
                        { id: 'faq', label: 'Supporto' }
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            variants={linkVariants}
                            onClick={() => handleLinkClick(item.id)}
                            className="text-left group flex items-center justify-between"
                        >
                            <span className={`font-oswald text-5xl font-bold uppercase tracking-tight transition-colors ${currentPage === item.id ? 'text-[#0066b2]' : 'text-slate-900 group-hover:text-slate-500'}`}>
                                {item.label}
                            </span>
                            <ChevronRight size={32} className={`opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${currentPage === item.id ? 'text-[#0066b2] opacity-100 translate-x-0' : 'text-slate-300'}`} />
                        </motion.button>
                    ))}
                </div>

                {/* Footer Info */}
                <motion.div variants={linkVariants} className="border-t border-slate-200 pt-8">
                    <p className="font-oswald text-slate-400 uppercase font-bold tracking-widest text-sm mb-6">Milano</p>
                    
                    {/* Icon Row */}
                    <div className="flex items-center gap-6">
                        <a 
                            href={INSTAGRAM_URL} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 shadow-sm"
                        >
                            <Instagram size={28} />
                        </a>
                        <a 
                            href="mailto:info@tacalabala.it"
                            className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 shadow-sm"
                        >
                            <Mail size={28} />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
