
import React, { useState, useRef } from 'react';
import { Send, MessageCircle, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as emailjs from '@emailjs/browser';

const SupportSection: React.FC = () => {
  const { supportConfig, mailConfig } = useStore();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const handleWhatsapp = () => {
      if (!supportConfig.whatsappNumber) {
          alert('Numero WhatsApp non configurato.');
          return;
      }
      const num = supportConfig.whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailConfig.serviceId || !mailConfig.templateId || !mailConfig.publicKey) {
        setFeedback({ type: 'error', msg: 'Configurazione Email mancante.' });
        return;
    }

    setLoading(true);
    setFeedback(null);

    emailjs.sendForm(
        mailConfig.serviceId, 
        mailConfig.templateId, 
        formRef.current!, 
        mailConfig.publicKey
    )
      .then(() => {
          setFeedback({ type: 'success', msg: 'Messaggio inviato!' });
          if(formRef.current) formRef.current.reset();
      }, (error) => {
          console.error(error);
          setFeedback({ type: 'error', msg: 'Errore nell\'invio.' });
      })
      .finally(() => {
          setLoading(false);
      });
  };

  // Button Style: Completely removed border and border-hover effects
  const buttonClass = "w-full md:w-auto min-w-[200px] relative overflow-hidden group/btn bg-white border-0 text-slate-900 hover:text-white py-3 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 transform-gpu active:scale-95";

  return (
    <section className="relative pb-0 pt-24 overflow-hidden bg-slate-900 border-t border-slate-800">
      
      {/* Central Axis Continuity (Changes color/opacity on dark bg) */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-white/5 border-l border-dashed border-white/10"></div>
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
             <span className="inline-block py-1 px-3 border border-slate-700 rounded-full bg-slate-800 text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-6 shadow-sm">
                Assistenza H24
            </span>
             <h2 className="font-oswald text-4xl md:text-5xl font-bold uppercase mb-4 text-white">
                Siamo qui <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066b2] to-[#004a80]">per te</span>
             </h2>
             <p className="text-slate-400 max-w-lg mx-auto font-light text-lg">Non sei solo un cliente, sei parte della squadra. Per qualsiasi dubbio, noi ci siamo.</p>
        </div>

        {/* --- MAIN CONTACT STACK (Vertical) --- */}
        <div className="flex flex-col gap-6 mb-24">
            
            {/* 1. WhatsApp Card (Darker Theme) */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-slate-700 transition-colors duration-500 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                     <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 border border-[#25D366]/20">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                         <h3 className="font-oswald text-2xl uppercase font-bold text-white">Chatta con noi</h3>
                         <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-xs">
                             Il modo più veloce per info su taglie e spedizioni. <br/>Risposta immediata.
                         </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleWhatsapp}
                    className={buttonClass}
                >
                    <span className="absolute inset-0 bg-[#25D366] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                    <span className="relative z-10 flex items-center gap-2">
                        <MessageCircle size={16} /> WhatsApp
                    </span>
                </button>
            </div>

            {/* 2. Email Card (Darker Theme) */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-slate-700 transition-colors duration-500 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                     <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 bg-blue-500/10 text-[#0066b2] rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h3 className="font-oswald text-2xl uppercase font-bold text-white">Scrivici una mail</h3>
                            <p className="text-slate-400 text-sm mt-1 font-medium">Rispondiamo entro 24 ore lavorative.</p>
                        </div>
                    </div>
                </div>

                <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required name="user_name" type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-[#0066b2] outline-none transition-colors placeholder:text-slate-500 font-medium" placeholder="Nome" />
                        <input required name="user_email" type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-[#0066b2] outline-none transition-colors placeholder:text-slate-500 font-medium" placeholder="Email" />
                    </div>
                    <textarea required name="message" rows={3} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-[#0066b2] outline-none transition-colors resize-none placeholder:text-slate-500 font-medium" placeholder="Il tuo messaggio..."></textarea>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                        {feedback && (
                            <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-lg w-full md:w-auto uppercase tracking-wide ${feedback.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                                {feedback.type === 'success' ? <CheckCircle2 size={14}/> : null} {feedback.msg}
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`${buttonClass} ml-auto`}
                        >
                             <span className="absolute inset-0 bg-[#0066b2] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Invia</>}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

        </div>

      </div>
    </section>
  );
};

export default SupportSection;
