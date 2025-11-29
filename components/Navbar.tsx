
import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, ShoppingBag } from 'lucide-react';
import { LOGO_URL } from '../constants';
import { useStore } from '../store/useStore';

interface NavbarProps {
  currentPage: 'home' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout';
  onNavigate: (page: 'home' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout', hash?: string) => void;
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

  const handleLinkClick = (page: any, hash?: string) => {
    onNavigate(page, hash);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isScrolled || currentPage !== 'home' ? 'bg-white/95 backdrop-blur-xl border-slate-200 py-2 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <button onClick={() => handleLinkClick('home')} className="relative z-50 focus:outline-none flex items-center justify-center mx-4">
             <img src={LOGO_URL} alt="Tacalabala Milano" className="h-20 md:h-36 w-auto object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </button>

        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-8 border-r border-slate-200 pr-8 mr-8 h-6">
            <button onClick={() => handleLinkClick('home')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Home <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'home' ? 'w-full' : ''}`}></span>
            </button>
             <button onClick={() => handleLinkClick('chi-siamo')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Chi Siamo <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'chi-siamo' ? 'w-full' : ''}`}></span>
            </button>
            <button onClick={() => handleLinkClick('contact')} className={`text-xs font-bold uppercase tracking-[0.2em] hover:text-[#0066b2] transition-all duration-300 relative group text-slate-800`}>
              Contatti <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[#0066b2] transition-all duration-300 group-hover:w-full ${currentPage === 'contact' ? 'w-full' : ''}`}></span>
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

        <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleCart} className="relative p-2 text-slate-900 hover:text-[#0066b2] transition-colors"><ShoppingBag size={24} />{cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#0066b2] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}</button>
            <button className="text-slate-900 relative z-50 hover:text-[#0066b2] transition-colors p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </div>
      
      {/* Mobile Menu Content (Simplified for brevity) */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-500 ease-in-out md:hidden flex items-center justify-center ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-8 text-center p-6 w-full max-w-sm">
          <button onClick={() => handleLinkClick('home')} className="text-4xl font-oswald text-slate-900 hover:text-[#0066b2] uppercase tracking-widest font-bold">Home</button>
          <button onClick={() => handleLinkClick('chi-siamo')} className="text-4xl font-oswald text-slate-900 hover:text-[#0066b2] uppercase tracking-widest font-bold">Chi Siamo</button>
          <button onClick={() => handleLinkClick('contact')} className="text-4xl font-oswald text-slate-900 hover:text-[#0066b2] uppercase tracking-widest font-bold">Contatti</button>
          <button onClick={() => handleLinkClick('faq')} className="text-4xl font-oswald text-slate-900 hover:text-[#0066b2] uppercase tracking-widest font-bold">FAQ</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
