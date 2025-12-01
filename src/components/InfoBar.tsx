
import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

const InfoBar: React.FC = () => {
  const { shippingConfig } = useStore();

  return (
    <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Decorative Background like About section */}
        <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
            <div className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"></div>
        </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Widget 1: Dynamic Free Shipping */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 flex flex-col items-center text-center relative overflow-hidden">
             {/* Background Icon Fade */}
             <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:text-blue-50 group-hover:opacity-100 transition-colors duration-500 pointer-events-none">
                 <Truck size={100} strokeWidth={1} />
             </div>
             
             <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl mx-auto">
                    <Truck size={24} className="text-[#0066b2]" />
                </div>
                <h3 className="font-oswald text-xl uppercase font-bold text-slate-900 mb-2 group-hover:text-[#0066b2] transition-colors">Spedizione Gratuita</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Per tutti gli ordini in Italia superiori a <span className="font-bold text-slate-900">€{shippingConfig.italyThreshold}</span>. Spediamo in 24/48h.
                </p>
             </div>
          </div>

          {/* Widget 2: Easy Returns */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:text-green-50 group-hover:opacity-100 transition-colors duration-500 pointer-events-none">
                 <RefreshCw size={100} strokeWidth={1} />
             </div>

             <div className="relative z-10">
                <div className="w-14 h-14 bg-green-50 border border-green-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl mx-auto">
                    <RefreshCw size={24} className="text-green-600" />
                </div>
                <h3 className="font-oswald text-xl uppercase font-bold text-slate-900 mb-2 group-hover:text-[#0066b2] transition-colors">Reso Facile</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Hai 14 giorni per cambiare idea. Procedura di reso semplice e veloce, senza stress.
                </p>
            </div>
          </div>

          {/* Widget 3: Secure Payments */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:text-purple-50 group-hover:opacity-100 transition-colors duration-500 pointer-events-none">
                 <ShieldCheck size={100} strokeWidth={1} />
             </div>

             <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-50 border border-purple-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rounded-2xl mx-auto">
                    <ShieldCheck size={24} className="text-purple-600" />
                </div>
                <h3 className="font-oswald text-xl uppercase font-bold text-slate-900 mb-2 group-hover:text-[#0066b2] transition-colors">Pagamenti Sicuri</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Accettiamo Carte, Apple Pay e Google Pay. Transazioni crittografate al 100%.
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InfoBar;
