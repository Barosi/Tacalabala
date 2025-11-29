
import React, { useState, useRef } from 'react';
import { Send, MessageCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
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
    
    // 1. Validazione Configurazione
    if (!mailConfig.serviceId || !mailConfig.templateId || !mailConfig.publicKey) {
        setFeedback({ type: 'error', msg: 'Configurazione Email mancante nel pannello Admin.' });
        return;
    }

    setLoading(true);
    setFeedback(null);

    // 2. Invio con EmailJS usando i parametri dello Store
    emailjs.sendForm(
        mailConfig.serviceId, 
        mailConfig.templateId, 
        formRef.current!, 
        mailConfig.publicKey
    )
      .then((result) => {
          setFeedback({ type: 'success', msg: 'Messaggio inviato con successo! Ti risponderemo presto.' });
          if(formRef.current) formRef.current.reset(); // Pulisce il form
      }, (error) => {
          console.error(error);
          setFeedback({ type: 'error', msg: 'Errore nell\'invio. Riprova o scrivici su WhatsApp.' });
      })
      .finally(() => {
          setLoading(false);
      });
  };

  return (
    <section id="contact" className="pt-64 pb-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-5xl">
        
         <div className="text-center mb-16">
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                Supporto <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Clienti</span>
             </h2>
             <p className="text-slate-500">Siamo qui per ogni tifoso nerazzurro.</p>
        </div>
   
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* --- COLONNA SINISTRA (WhatsApp) --- */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col justify-between h-full">
                <div>
                     <h3 className="font-oswald text-2xl uppercase text-slate-900 mb-6 flex items-center gap-2">
                        Chatta con noi <MessageCircle size={24} className="text-[#25D366]" />
                     </h3>
                     <p className="text-slate-500 mb-8 leading-relaxed">
                        Hai bisogno di una risposta veloce su taglie, spedizioni o dettagli dei prodotti? Il modo più rapido è scriverci su WhatsApp.
                     </p>
                     <div className="space-y-4 mb-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-[#0066b2] rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Disponibilità</span>
                                <span className="text-slate-900 font-medium text-sm">Lun - Ven: 9:00 - 18:00</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tempo di risposta</span>
                                <span className="text-slate-900 font-medium text-sm">Di solito entro 1 ora</span>
                            </div>
                        </div>
                     </div>
                </div>
                <div className="pt-2">
                    <button 
                        onClick={handleWhatsapp}
                        className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] font-bold uppercase tracking-widest py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/20"
                    >
                        Apri Chat WhatsApp <MessageCircle size={16} />
                    </button>
                </div>
            </div>

            {/* --- COLONNA DESTRA (Email Form CON LOGICA) --- */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col justify-between h-full">
                 
                 <div className="w-full">
                     <h3 className="font-oswald text-2xl uppercase text-slate-900 mb-6 flex items-center gap-2">
                        Inviaci un messaggio <Send size={24} className="text-[#0066b2]" />
                     </h3>
                     
                     {/* Il form è collegato alla funzione sendEmail */}
                     <form ref={formRef} onSubmit={sendEmail} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nome</label>
                                <input required name="user_name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors" placeholder="Nome" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cognome</label>
                                <input name="user_surname" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors" placeholder="Cognome" />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                            <input required name="user_email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors" placeholder="nome@email.com" />
                        </div>
                        <div className="space-y-1 w-full">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Messaggio</label>
                            <textarea 
                                required
                                name="message"
                                rows={4} 
                                className="w-full min-h-[140px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#0066b2] outline-none transition-colors resize-none" 
                                placeholder="Come possiamo aiutarti?"
                            ></textarea>
                        </div>
                        
                        {/* Messaggi di Feedback */}
                        {feedback && (
                            <div className={`text-xs font-bold p-3 rounded-lg ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {feedback.msg}
                            </div>
                        )}
                     </form>
                 </div>

                 <div className="pt-8">
                    <button 
                        type="button" 
                        // Importante: onClick triggera il submit del form esterno se non è dentro
                        onClick={() => formRef.current?.requestSubmit()} 
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-[#0066b2] disabled:bg-slate-400 font-bold uppercase tracking-widest py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Invia Messaggio <Send size={16} /></>}
                    </button>
                 </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
