
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Plus, Minus } from 'lucide-react';

// Configurazione specifica per le 11 domande: Posizione + Etichetta Argomento
const FAQ_MAP = [
    { id: '1', label: 'Spedizioni', left: '50%', top: '10%' },       // Portiere
    { id: '2', label: 'Politica Resi', left: '20%', top: '25%' },    // Difesa Sx
    { id: '3', label: 'Materiali', left: '40%', top: '28%' },        // Difesa Cen Sx
    { id: '4', label: 'Guida Taglie', left: '60%', top: '28%' },     // Difesa Cen Dx
    { id: '5', label: 'Pagamenti', left: '80%', top: '25%' },        // Difesa Dx
    { id: '6', label: 'Fatturazione', left: '15%', top: '55%' },     // Centrocampo Sx
    { id: '7', label: 'Tracking', left: '38%', top: '50%' },         // Regista
    { id: '8', label: 'Lavaggio', left: '62%', top: '50%' },         // Mezzala
    { id: '9', label: 'Estero', left: '85%', top: '55%' },           // Centrocampo Dx
    { id: '10', label: 'Restock', left: '35%', top: '80%' },         // Attacco Sx
    { id: '11', label: 'Concetto', left: '65%', top: '80%' },      // Attacco Dx
];

const FAQSection: React.FC = () => {
    const { supportConfig } = useStore();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

    // Blocca lo scroll quando il modal (desktop) è aperto
    useEffect(() => {
        if (activeId && window.innerWidth >= 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [activeId]);

    const fieldFaqs = supportConfig.faqs.slice(0, 11);
    const selectedFaq = supportConfig.faqs.find(f => f.id === activeId);

    return (
        <section className="pt-36 md:pt-48 pb-16 md:pb-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
             
            {/* BACKGROUND: Pitch Lines + Central Fade */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-200 rounded-full opacity-60"></div>
                <div className="absolute inset-0 flex justify-center">
                    <div 
                        className="w-px h-full bg-transparent border-l border-dashed border-slate-300"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
                    ></div>
                </div>
                <div className="absolute top-1/3 left-0 w-full h-px bg-slate-100"></div>
            </div>

             {/* Header */}
             <div className="container mx-auto px-6 relative z-20 text-center mb-12 md:mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-4 text-slate-900 leading-[1.1]">
                        Tattiche & <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Risposte</span>
                    </h2>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Tutto quello che devi sapere</p>
                </motion.div>
             </div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                
                {/* --- MOBILE VIEW: MODERN ACCORDION --- */}
                <div className="md:hidden space-y-4">
                    {supportConfig.faqs.map((faq) => (
                        <div key={faq.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setMobileExpanded(mobileExpanded === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between p-5 text-left bg-white active:bg-slate-50 transition-colors"
                            >
                                <span className="font-oswald font-bold uppercase text-slate-900 text-lg leading-tight pr-4">{faq.question}</span>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${mobileExpanded === faq.id ? 'bg-[#0066b2] border-[#0066b2] text-white rotate-180' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {mobileExpanded === faq.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-5 pb-6 pt-0 text-slate-500 leading-relaxed text-sm font-light">
                                            <div className="w-8 h-1 bg-[#0066b2] mb-3 rounded-full opacity-50"></div>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* --- DESKTOP VIEW: TACTICAL BOARD --- */}
                <div className="hidden md:block w-full relative aspect-[16/9] bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden group select-none">
                    
                    {/* Background Pitch Graphics */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(#0066b2_1px,transparent_1px)] [background-size:20px_20px]"></div>
                        <div className="absolute top-8 bottom-8 left-8 right-8 border-2 border-slate-900 rounded-[2rem]"></div>
                        <div className="absolute top-1/2 left-8 right-8 h-px bg-slate-900"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-slate-900 rounded-full"></div>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1/4 h-32 border-b-2 border-l-2 border-r-2 border-slate-900 rounded-b-xl"></div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-1/4 h-32 border-t-2 border-l-2 border-r-2 border-slate-900 rounded-t-xl"></div>
                    </div>

                    {/* INTERACTIVE NODES */}
                    {fieldFaqs.map((faq) => {
                        const mapData = FAQ_MAP.find(m => m.id === faq.id) || { label: 'Info', left: '50%', top: '50%' };
                        const isActive = activeId === faq.id;

                        return (
                            <div 
                                key={faq.id}
                                className="absolute z-20 flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: mapData.left, top: mapData.top }}
                            >
                                <button 
                                    onClick={() => setActiveId(faq.id)}
                                    className={`relative outline-none transition-all duration-300 rounded-full flex items-center justify-center w-16 h-16 group/btn ${isActive ? 'scale-110' : 'hover:scale-110'}`}
                                >
                                    <span className="absolute inset-0 rounded-full bg-[#0066b2] opacity-0 group-hover/btn:opacity-60 blur-md transition-opacity duration-300"></span>
                                    <span className={`relative z-10 w-full h-full rounded-full border-2 flex items-center justify-center shadow-xl transition-colors duration-300 ${isActive ? 'bg-slate-900 border-white text-white' : 'bg-white border-[#0066b2] text-[#0066b2] group-hover/btn:bg-[#0066b2] group-hover/btn:text-white group-hover/btn:border-transparent'}`}>
                                        <span className="font-oswald font-bold text-2xl">{faq.id}</span>
                                    </span>
                                </button>
                                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm whitespace-nowrap">
                                    {mapData.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FULL SCREEN OVERLAY MODAL (DESKTOP ONLY) */}
            <AnimatePresence>
                {activeId && selectedFaq && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] hidden md:flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveId(null)}></div>
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg p-14 rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-100"
                        >
                            <button onClick={() => setActiveId(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all duration-300 shadow-sm hover:shadow-lg">
                                <X size={24} />
                            </button>
                            <div className="mb-8 pr-12">
                                <div className="inline-block px-3 py-1 bg-blue-50 text-[#0066b2] rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                                    {FAQ_MAP.find(m => m.id === selectedFaq.id)?.label || 'Extra Time'}
                                </div>
                                <h3 className="font-oswald text-5xl font-bold uppercase text-slate-900 leading-[0.95]">{selectedFaq.question}</h3>
                            </div>
                            <div className="w-16 h-1.5 bg-[#0066b2] mb-8 rounded-full"></div>
                            <div className="prose prose-lg prose-slate max-w-none">
                                <p className="text-slate-600 text-xl leading-relaxed font-light">{selectedFaq.answer}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
};

export default FAQSection;
