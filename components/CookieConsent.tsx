
import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tacalabala-cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    } else if (consent === 'true') {
      // User already accepted, load scripts
      loadThirdPartyScripts();
    }
  }, []);

  const loadThirdPartyScripts = () => {
    // Inserire qui i pixel di Facebook e Google Analytics
    // Questi script NON partono finché l'utente non clicca su "Accetta Tutto"
    console.log("Consent given. Loading Google Analytics & Pixels...");
    
    // Esempio:
    /*
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`;
    script.async = true;
    document.head.appendChild(script);
    */
  };

  const handleAccept = () => {
    localStorage.setItem('tacalabala-cookie-consent', 'true');
    loadThirdPartyScripts();
    setIsVisible(false);
  };

  const handleReject = () => {
      // Salva il rifiuto: non verranno caricati script di tracciamento
      localStorage.setItem('tacalabala-cookie-consent', 'false');
      setIsVisible(false);
  };

  // Naviga alla pagina privacy (simulazione refresh o gestione router esterna se necessario, 
  // qui usiamo un href semplice per semplicità dato che è un componente globale)
  const openPrivacy = () => {
      // Dispatch event to app to switch page if possible, otherwise simple anchor
      const event = new CustomEvent('navigate-to-privacy');
      window.dispatchEvent(event);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-md text-white p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-full text-[#0066b2] hidden md:block">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h4 className="font-oswald font-bold uppercase text-lg mb-2 flex items-center gap-2">
                    <Cookie size={18} className="md:hidden text-[#0066b2]" />
                    Gestione dei Cookie
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl text-justify md:text-left">
                    Utilizziamo cookie per assicurarti la migliore esperienza sul sito. I cookie di profilazione (es. Google Analytics, Facebook Pixel) vengono installati solo previo tuo consenso. 
                    Senza il tuo consenso, utilizzeremo solo cookie tecnici essenziali.
                    Per maggiori info, consulta la <strong className="text-white cursor-pointer underline hover:text-[#0066b2]" onClick={() => window.location.hash = 'privacy'}>Cookie Policy</strong>.
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto min-w-[300px]">
             <button 
                onClick={handleReject}
                className="w-full sm:flex-1 py-3 px-6 bg-transparent border border-slate-700 text-slate-300 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all duration-300"
            >
                Solo Tecnici
            </button>
             <button 
                onClick={handleAccept}
                className="w-full sm:flex-1 py-3 px-8 bg-white text-slate-900 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#0066b2] hover:text-white transition-all duration-300 shadow-lg transform active:scale-95 whitespace-nowrap"
            >
                Accetta Tutto
            </button>
        </div>

      </div>
    </div>
  );
};

export default CookieConsent;
