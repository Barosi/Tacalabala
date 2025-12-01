
import React from 'react';
import { Instagram, ArrowUp } from 'lucide-react';
import { INSTAGRAM_URL } from '../constants';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcApplePay } from "react-icons/fa";

interface FooterProps {
    onNavigate: (page: 'privacy' | 'terms') => void;
}

const PaymentIcons = () => (
    <div className="flex gap-4 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
        <FaCcVisa className="text-2xl text-white" title="Visa" />
        <FaCcMastercard className="text-2xl text-white" title="Mastercard" />
        <FaCcAmex className="text-2xl text-white" title="American Express" />
        <FaCcApplePay className="text-2xl text-white" title="Apple Pay" />
    </div>
);

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 relative overflow-hidden border-t border-slate-800">
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-start">
            
            {/* Left: Brand & Copy */}
            <div className="text-center md:text-left space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} Tacalabala Milano
                </p>
                <div className="text-[10px] text-slate-600 leading-tight space-y-0.5">
                    <p className="font-bold text-slate-500">Tacalabala S.r.l.</p>
                    <p>Sede Legale: Via del Calcio 10, 20100 Milano (MI)</p>
                    <p>P.IVA / C.F.: 12345678901</p>
                    <p>REA: MI-123456</p>
                    <p>Capitale Sociale: €10.000,00 i.v.</p>
                    <p>PEC: tacalabala@legalmail.it</p>
                </div>
            </div>

            {/* Center: Social & Links */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                 <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                    <Instagram size={20} />
                </a>
                <button onClick={() => onNavigate('privacy')} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-[0.2em] font-bold transition-colors">Privacy & Cookie Policy</button>
                <button onClick={() => onNavigate('terms')} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-[0.2em] font-bold transition-colors">Termini e Condizioni</button>
            </div>

            {/* Right: Payment & Up */}
            <div className="flex items-center justify-center md:justify-end gap-8">
                <PaymentIcons />
                <button 
                    onClick={scrollToTop}
                    className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Torna su"
                >
                    <ArrowUp size={16} /> 
                </button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
