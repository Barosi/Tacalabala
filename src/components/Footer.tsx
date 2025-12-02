
import React from 'react';
import { Instagram, ArrowUp, Mail } from 'lucide-react';
import { INSTAGRAM_URL } from '../constants';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcApplePay, FaPaypal } from "react-icons/fa";

interface FooterProps {
    onNavigate: (page: 'home' | 'store' | 'contact' | 'faq' | 'chi-siamo' | 'admin' | 'checkout' | 'product-details' | 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden">
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
       {/* 1. Dati Societari */}
            <div>
                 <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-6">Azienda</h3>
                 <ul className="space-y-4 text-xs">
                    <li>Tacalabala S.r.l.</li>
                    <li>Via del Calcio 10, Milano</li>
                    <li>P.IVA: 12345678901</li>
                    <li>REA: MI-123456</li>
                 </ul>
            </div>


            {/* 2. Link Utili */}
            <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-6">Supporto</h3>
                <ul className="space-y-4 text-xs">
                    <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors text-left">FAQ</button></li>
                    <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors text-left">Termini e Condizioni</button></li>
                    <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                </ul>
            </div>

          {/* 3. Brand */}
            <div className="md:col-span-1 space-y-6">
               <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-6">Social</h3>
                <div className="flex gap-4">
                     <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                        <Instagram size={18} />
                    </a>
                    <a href="mailto:info@tacalabala.it" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                        <Mail size={18} />
                    </a>
                </div>
            </div>

            {/* 4. Pagamenti e Newsletter (Placeholder) */}
            <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-6">Pagamenti Sicuri</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                    <FaCcVisa className="text-2xl text-slate-500 hover:text-white transition-colors" />
                    <FaCcMastercard className="text-2xl text-slate-500 hover:text-white transition-colors" />
                    <FaCcAmex className="text-2xl text-slate-500 hover:text-white transition-colors" />
                    <FaCcApplePay className="text-2xl text-slate-500 hover:text-white transition-colors" />
                    <FaPaypal className="text-xl text-slate-500 hover:text-white transition-colors" />
                </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">© {new Date().getFullYear()} Tacalabala Milano. All rights reserved.</p>
            <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors"
            >
                Torna su <ArrowUp size={14} /> 
            </button>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
