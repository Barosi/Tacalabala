
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

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

    // Blocca lo scroll quando il modal è aperto
    useEffect(() => {
        if (activeId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [activeId]);

    // Separa le FAQ: Prime 11 in campo, le altre in panchina
    const fieldFaqs = supportConfig.faqs.slice(0, 11);

    const selectedFaq = supportConfig.faqs.find(f => f.id === activeId);

    return (
        <section className="pt-32 md:pt-48 pb-16 md:pb-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
             
             {/* Header Aggiornato stile Chi Siamo */}
             <div className="container mx-auto px-6 relative z-20 text-center mb-16">
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

            {/* Container allargato SOLO CAMPO - Aumentato a max-w-7xl e Aspect Ratio più alto */}
            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                
                {/* TACTICAL BOARD CONTAINER (Full Width, Taller Ratio) */}
                <div className="w-full relative aspect-[3/4] md:aspect-[16/9] bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden group select-none">
                    
                    {/* Background Pitch Graphics */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                        {/* Grass Texture */}
                        <div className="absolute inset-0 bg-[radial-gradient(#0066b2_1px,transparent_1px)] [background-size:20px_20px]"></div>
                        
                        {/* Lines */}
                        <div className="absolute top-8 bottom-8 left-8 right-8 border-2 border-slate-900 rounded-[2rem]"></div> {/* Outer Line */}
                        <div className="absolute top-1/2 left-8 right-8 h-px bg-slate-900"></div> {/* Midfield Line */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-slate-900 rounded-full"></div> {/* Center Circle */}
                        
                        {/* Penalty Area Top */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1/4 h-32 border-b-2 border-l-2 border-r-2 border-slate-900 rounded-b-xl"></div>
                        {/* Penalty Area Bottom */}
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
                                {/* The Dot Button */}
                                <button 
                                    onClick={() => setActiveId(faq.id)}
                                    className={`
                                        relative outline-none transition-all duration-300 rounded-full
                                        flex items-center justify-center
                                        w-12 h-12 md:w-16 md:h-16
                                        group/btn 
                                        ${isActive ? 'scale-110' : 'hover:scale-110'}
                                    `}
                                >
                                    {/* GLOW EFFECT: Visible only when hovering the button itself */}
                                    <span className="absolute inset-0 rounded-full bg-[#0066b2] opacity-0 group-hover/btn:opacity-60 blur-md transition-opacity duration-300"></span>
                                    
                                    {/* Core Dot (Background & Number) */}
                                    <span className={`
                                        relative z-10 w-full h-full rounded-full border-2 flex items-center justify-center shadow-xl transition-colors duration-300
                                        ${isActive 
                                            ? 'bg-slate-900 border-white text-white' 
                                            : 'bg-white border-[#0066b2] text-[#0066b2] group-hover/btn:bg-[#0066b2] group-hover/btn:text-white group-hover/btn:border-transparent'}
                                    `}>
                                        <span className="font-oswald font-bold text-lg md:text-2xl">{faq.id}</span>
                                    </span>
                                </button>
                                
                                {/* Topic Label - Static Style */}
                                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm whitespace-nowrap">
                                    {mapData.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FULL SCREEN OVERLAY MODAL */}
            <AnimatePresence>
                {activeId && selectedFaq && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setActiveId(null)}
                        ></div>

                        {/* Modal Card */}
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-100"
                        >
                            <button 
                                onClick={() => setActiveId(null)}
                                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all duration-300 shadow-sm hover:shadow-lg"
                                title="Chiudi"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8 pr-12">
                                <div className="inline-block px-3 py-1 bg-blue-50 text-[#0066b2] rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                                    {FAQ_MAP.find(m => m.id === selectedFaq.id)?.label || 'Extra Time'}
                                </div>
                                <h3 className="font-oswald text-3xl md:text-5xl font-bold uppercase text-slate-900 leading-[0.95]">
                                    {selectedFaq.question}
                                </h3>
                            </div>
                            
                            <div className="w-16 h-1.5 bg-[#0066b2] mb-8 rounded-full"></div>

                            <div className="prose prose-lg prose-slate max-w-none">
                                <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-light">
                                    {selectedFaq.answer}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
};

export default FAQSection;
