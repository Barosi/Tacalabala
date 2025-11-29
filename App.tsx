
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
import InfoBar from './components/InfoBar';
import { ArrowLeft } from 'lucide-react';
import { useStore } from './store/useStore';

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
        <section className="min-h-screen flex flex-col items-center bg-slate-50 px-4 t-32 md:pt-48 pb-16 md:pb-24">
            <div className="text-center mb-12">
                <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                    Area <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Riservata</span>
                </h2>
                <p className="text-slate-500 text-sm tracking-widest uppercase font-bold">Accesso limitato allo staff</p>
            </div>
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 w-full max-w-md relative">
                <button type="button" onClick={onCancel} className="absolute top-8 left-8 text-slate-400 hover:text-[#0066b2] transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <ArrowLeft size={14} /> Home
                </button>
                <div className="space-y-4 mt-12">
                    <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0066b2] outline-none" value={user} onChange={e => setUser(e.target.value)}/>
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0066b2] outline-none" value={pass} onChange={e => setPass(e.target.value)}/>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center text-xs font-bold uppercase tracking-wide border border-red-100">Credenziali Errate</div>}
                    <button type="submit" className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#0066b2] transition-colors mt-2">Accedi</button>
                </div>
            </form>
        </section>
    );
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { products } = useStore();

  const handleNavigate = (page: 'home' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout', hash?: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (page === 'home' && hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = () => { setIsAuthenticated(false); setCurrentPage('home'); };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0066b2] selection:text-white flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <CartDrawer onCheckout={() => handleNavigate('checkout')} />
      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            <Hero />
            <div id="products"><ProductGrid products={products} /></div>
            <About />
            <SupportSection />
            <InfoBar />
          </>
        )}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'faq' && <FAQSection />}
        {currentPage === 'chi-siamo' && <ChiSiamo />}
        {currentPage === 'checkout' && <Checkout onBack={() => handleNavigate('home')} />}
        {currentPage === 'admin' && (
            !isAuthenticated ? <Login onLogin={setIsAuthenticated} onCancel={() => setCurrentPage('home')} /> : <Admin onLogout={handleLogout} />
        )}
      </main>
      <Footer />
    </div>
  );
};
export default App;
