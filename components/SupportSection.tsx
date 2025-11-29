
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

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Visual Continuity: Central Axis Line */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-slate-200 border-l border-dashed border-slate-300"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
             <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-white text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-6">
                Assistenza H24
            </span>
             <h2 className="font-oswald text-4xl md:text-5xl font-bold uppercase mb-4 text-slate-900">
                Supporto <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Clienti</span>
             </h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* 1. WhatsApp Banner Card (Elongated) */}
            <div className="bg-white p-8 md:px-12 md:py-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#0066b2] transition-all duration-300 group">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-[#25D366] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-500">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900">Chatta con noi</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm">Risposta immediata su taglie e spedizioni direttamente su WhatsApp.</p>
                    </div>
                </div>
                <button 
                    onClick={handleWhatsapp}
                    className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#25D366] transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    Apri Chat <MessageCircle size={16} />
                </button>
            </div>

            {/* 2. Email Form Card (Elongated) */}
            <div className="bg-white p-8 md:px-12 md:py-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-200 hover:border-[#0066b2] transition-all duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-blue-50 text-[#0066b2] rounded-full flex items-center justify-center">
                        <Mail size={20} />
                    </div>
                    <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900">Inviaci un messaggio</h3>
                </div>

                <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Nome</label>
                            <input required name="user_name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors" placeholder="Il tuo nome" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Email</label>
                            <input required name="user_email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors" placeholder="tua@email.com" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Messaggio</label>
                        <textarea required name="message" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors resize-none" placeholder="Scrivi qui la tua richiesta..."></textarea>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {feedback ? (
                            <div className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg w-full md:w-auto ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {feedback.type === 'success' ? <CheckCircle2 size={16}/> : null} {feedback.msg}
                            </div>
                        ) : <div></div>}
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-auto px-10 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#0066b2] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Invia <Send size={16} /></>}
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
