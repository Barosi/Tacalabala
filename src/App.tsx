
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Contact from './components/Contact';
import FAQSection from './components/FAQSection';
import ChiSiamo from './components/ChiSiamo';
import SupportSection from './components/SupportSection';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Checkout from './components/Checkout';
import CartDrawer from './components/CartDrawer';
import CookieConsent from './components/CookieConsent';
import Store from './components/Store';
import ProductDetails from './components/ProductDetails';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { useStore } from './store/useStore';
import { Product } from './types';
import { motion } from 'framer-motion';

// Defined Page Types for Type Safety
type PageType = 'home' | 'store' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout' | 'product-details' | 'privacy' | 'terms';

const Login: React.FC<{onLogin: (s: boolean) => void, onCancel: () => void}> = ({ onLogin, onCancel }) => {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (user === 'admin' && pass === 'admin') {
            onLogin(true);
        } else {
            setError(true);
        }
    };

    return (
        <section className="min-h-screen flex flex-col items-center bg-slate-50 px-4 pt-32 md:pt-48 pb-16 md:pb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-12"
            >
                <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-4 text-slate-900 leading-[1.1]">
                    Area <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Riservata</span>
                </h2>
                <p className="text-slate-500 text-sm tracking-widest uppercase font-bold">Accesso limitato allo staff</p>
            </motion.div>
            
            <motion.form 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                onSubmit={handleLogin} 
                className="bg-white p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 w-full max-w-md relative"
            >
                <button type="button" onClick={onCancel} className="absolute top-8 left-8 text-slate-400 hover:text-[#0066b2] transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <ArrowLeft size={14} /> Home
                </button>
                <div className="space-y-4 mt-12">
                    <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0066b2] outline-none transition-colors" value={user} onChange={e => setUser(e.target.value)}/>
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0066b2] outline-none transition-colors" value={pass} onChange={e => setPass(e.target.value)}/>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center text-xs font-bold uppercase tracking-wide border border-red-100">Credenziali Errate</div>}
                    
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="w-auto min-w-[200px] relative overflow-hidden group/btn bg-white border border-slate-200 text-slate-500 hover:text-white py-3 px-10 rounded-full font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg active:scale-95 transform-gpu">
                             <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                             <span className="relative z-10 flex items-center gap-2">
                                 <LogIn size={16} /> Accedi
                             </span>
                        </button>
                    </div>
                </div>
            </motion.form>
        </section>
    );
}

const App: React.FC = () => {
  const { products, initialize, isLoading } = useStore();

  // --- INIT DATA FROM DB ---
  useEffect(() => {
      initialize();
  }, [initialize]);

  // --- ROUTING LOGIC START ---
  const getPageFromUrl = (): PageType => {
      // Safe check for window availability
      if (typeof window === 'undefined') return 'home';
      const path = window.location.pathname.substring(1); 
      if (!path) return 'home';
      const validPages: PageType[] = ['home', 'store', 'contact', 'faq', 'chi-siamo', 'admin', 'checkout', 'product-details', 'privacy', 'terms'];
      if (validPages.includes(path as PageType)) return path as PageType;
      return 'home';
  };

  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initial load
  useEffect(() => {
      setCurrentPage(getPageFromUrl());
  }, []);

  useEffect(() => {
    const handlePopState = () => {
        const newPage = getPageFromUrl();
        setCurrentPage(newPage);
        if (newPage === 'product-details') {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (id) {
                const found = products.find(p => p.id === id);
                if (found) setSelectedProduct(found);
            }
        }
    };
    window.addEventListener('popstate', handlePopState);
    if (currentPage === 'product-details' && !selectedProduct && products.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            const found = products.find(p => p.id === id);
            if (found) setSelectedProduct(found);
        }
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, currentPage, selectedProduct]);

  const handleNavigate = (page: PageType, hash?: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    const url = page === 'home' ? '/' : `/${page}`;
    
    // SAFE NAVIGATION: Try/Catch allows app to work in sandboxed environments (like code previewers)
    // where history.pushState might be blocked due to security restrictions.
    try {
        window.history.pushState({}, '', url);
    } catch (e) {
        // Silently fail if history API is blocked
        console.debug('Navigation state update skipped (environment restriction)');
    }

    if (page === 'home' && hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleOpenProduct = (product: Product) => {
      setSelectedProduct(product);
      setCurrentPage('product-details');
      window.scrollTo(0, 0);
      try {
        window.history.pushState({}, '', `/product-details?id=${product.id}`);
      } catch (e) {
        // Silently fail
      }
  };

  const handleLogout = () => { setIsAuthenticated(false); handleNavigate('home'); };

  // --- LOADING SCREEN ---
  if (isLoading) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-[#0066b2] animate-spin mb-4" />
              <p className="font-oswald text-slate-900 uppercase font-bold tracking-widest text-lg animate-pulse">Caricamento Store...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0066b2] selection:text-white flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <CartDrawer onCheckout={() => handleNavigate('checkout')} />
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            <Hero />
            <div id="products"><ProductGrid products={products} onProductClick={handleOpenProduct} /></div>
            <About />
            <SupportSection />
          </>
        )}
        {currentPage === 'store' && <Store onProductClick={handleOpenProduct} />}
        {currentPage === 'product-details' && selectedProduct && (
            <ProductDetails 
                product={selectedProduct} 
                onBack={() => handleNavigate('store')} 
                onCheckout={() => handleNavigate('checkout')}
            />
        )}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'faq' && <FAQSection />}
        {currentPage === 'chi-siamo' && <ChiSiamo />}
        {currentPage === 'privacy' && <PrivacyPolicy onBack={() => handleNavigate('home')} />}
        {currentPage === 'terms' && <TermsAndConditions onBack={() => handleNavigate('home')} />}
        {currentPage === 'checkout' && <Checkout onBack={() => handleNavigate('home')} />}
        {currentPage === 'admin' && (
            !isAuthenticated ? <Login onLogin={setIsAuthenticated} onCancel={() => handleNavigate('home')} /> : <Admin onLogout={handleLogout} />
        )}
      </main>
      <CookieConsent />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};
export default App;
