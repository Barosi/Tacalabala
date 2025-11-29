
import React from 'react';
import { Instagram, Mail, ArrowUp } from 'lucide-react';
import { INSTAGRAM_URL } from '../constants';

// Importiamo le icone specifiche dal pacchetto "fa" (Font Awesome)
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcApplePay } from "react-icons/fa";

const PaymentIcons = () => (
    <div className="flex gap-4 items-center">
        {/* VISA - Blu scuro */}
        <FaCcVisa 
            className="text-3xl text-slate-400" 
            title="Visa"
        />

        {/* MASTERCARD - Rosso (o arancione scuro) */}
        <FaCcMastercard 
            className="text-3xl text-slate-400" 
            title="Mastercard"
        />

        {/* AMEX - Blu chiaro */}
        <FaCcAmex 
            className="text-3xl text-slate-400" 
            title="American Express"
        />

        {/* APPLE PAY - Nero */}
        <FaCcApplePay 
            className="text-3xl text-slate-400" 
            title="Apple Pay"
        />
    </div>
);

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-center">
            
            {/* Column 1: Brand & Tagline (Left) */}
            <div className="flex flex-col gap-4 text-center md:text-left">
                <p className="text-sm text-slate-400 leading-relaxed font-light tracking-wide">
                    Streetwear nerazzurro. <br/> 
                    Milano state of mind.
                </p>
            </div>

            {/* Column 2: Socials & Links (Center) */}
            <div className="flex flex-col items-center justify-center gap-6">
                 {/* Social Icons */}
                 <div className="flex gap-6">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-[#0066b2] hover:text-white transition-all border border-slate-700 hover:border-[#0066b2] shadow-lg hover:shadow-[#0066b2]/50 hover:-translate-y-1">
                        <Instagram size={20} />
                    </a>
                </div>
                {/* Legal Links below socials */}
                <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                    <a href="#" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Terms</a>
                </div>
            </div>

            {/* Column 3: Payment Methods (Right) */}
            <div className="flex flex-col items-center md:items-end gap-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Metodi di Pagamento</span>
                <PaymentIcons />
            </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} Tacalabala. All rights reserved.
            </p>
            
            <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#0066b2] transition-colors group"
            >
                Torna su <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
