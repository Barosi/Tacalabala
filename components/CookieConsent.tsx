
import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tacalabala-cookie-consent');
    if (!consent) {
      // Delay showing slightly for better UX
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('tacalabala-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-full text-[#0066b2] hidden md:block">
                <Cookie size={24} />
            </div>
            <div>
                <h4 className="font-oswald font-bold uppercase text-lg mb-2">Rispetto della Privacy (GDPR)</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    Utilizziamo cookie tecnici essenziali per far funzionare il carrello e migliorare la tua esperienza di navigazione. Nessun dato viene venduto a terze parti.
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none py-3 px-8 bg-white text-slate-900 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#0066b2] hover:text-white transition-all duration-300 shadow-lg transform active:scale-95 whitespace-nowrap"
            >
                Accetta Tutto
            </button>
        </div>

      </div>
    </div>
  );
};

export default CookieConsent;
