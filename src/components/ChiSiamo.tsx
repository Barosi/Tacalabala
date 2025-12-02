
import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, LayoutTemplate } from 'lucide-react';

const ChiSiamo: React.FC = () => {
  return (
    <section id="chi-siamo" className="pt-32 md:pt-48 pb-24 relative overflow-hidden bg-slate-50">
      
      {/* BACKGROUND: Pitch Lines + Central Fade */}
      <div className="absolute inset-0 pointer-events-none z-0">
           {/* Center Circle Graphic - ONLY RING, NO DOT */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-200 rounded-full opacity-60"></div>
            
            {/* Axis Line with Gradient Fade & Dashed Style */}
            <div className="absolute inset-0 flex justify-center">
                <div 
                    className="w-px h-full bg-transparent border-l border-dashed border-slate-300"
                    style={{ 
                        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                    }}
                ></div>
            </div>
            
            {/* Horizontal Line (Midfield) */}
            <div className="absolute top-1/3 left-0 w-full h-px bg-slate-100"></div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* --- 1. TITOLO (FUORI DAL CONTAINER) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
             <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase text-slate-900 leading-[1.1] tracking-tight">
                In trasferta e <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">giù in Città</span>
            </h2>
        </motion.div>

        {/* --- 2. DESCRIZIONE (NEL CONTAINER GLASS) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-16" 
        >
             <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden max-w-4xl mx-auto">
                
                <div className="text-slate-600 text-base md:text-lg font-light leading-relaxed space-y-6 relative z-10">
                    <p>
                        <strong className="text-slate-900 font-medium">Tacalabala</strong> non è solo un brand, è un manifesto d'appartenenza. Nati tra i gradoni di San Siro e cresciuti nelle strade di Milano.
                    </p>
                    <p>
                        La nostra missione è semplice ma ambiziosa: prendere l'estetica sacra della maglia nerazzurra e fonderla con i codici del design urbano contemporaneo. <span className="font-semibold text-[#0066b2]">Non facciamo repliche, creiamo visioni.</span>
                    </p>
                </div>
             </div>
        </motion.div>

        {/* --- 3. FORMAZIONE SECTION --- */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-4" 
        >
             <div className="flex flex-col items-center text-center mb-10">
                 <span className="inline-block py-1 px-4 border border-[#0066b2] rounded-full bg-white text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-4 shadow-sm">
                    Staff Tecnico
                 </span>
                 <h2 className="font-oswald text-4xl md:text-5xl font-bold uppercase text-slate-900">La <span className="text-[#0066b2]">Formazione</span></h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* Player Card 1 */}
                <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <PenTool size={100} />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        {/* NUMBER COLOR CHANGED TO TACALABALA BLUE */}
                        <div className="w-16 h-16 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center font-oswald font-bold text-2xl border-2 border-[#0066b2] group-hover:bg-white group-hover:text-[#0066b2] transition-colors">
                            7
                        </div>
                        <div>
                            <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 leading-none">Lorenzo Demitri</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0066b2] mt-1">Founder & Creative Director</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-light text-sm leading-relaxed border-t border-slate-100 pt-4">
                        Visionario e tifoso. Ha trasformato la sua ossessione per i dettagli delle maglie storiche in un nuovo linguaggio visivo.
                    </p>
                </motion.div>

                {/* Player Card 2 */}
                <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <LayoutTemplate size={100} />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        {/* NUMBER COLOR CHANGED TO TACALABALA BLUE */}
                        <div className="w-16 h-16 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center font-oswald font-bold text-2xl border-2 border-[#0066b2] group-hover:bg-white group-hover:text-[#0066b2] transition-colors">
                          10  
                        </div>
                        <div>
                            <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 leading-none">Andrea Agnelli</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0066b2] mt-1">Head of Operations</p>
                        </div>
                    </div>
                    <p className="text-slate-500 font-light text-sm leading-relaxed border-t border-slate-100 pt-4">
                        Il motore della logistica. Assicura che ogni pacco parta puntuale e che l'esperienza cliente sia impeccabile.
                    </p>
                </motion.div>

             </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ChiSiamo;
