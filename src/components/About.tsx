
import React from 'react';
import { MapPin, Trophy, Layers } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const About: React.FC = () => {
  // Blue Card Style matching ChiSiamo.tsx
  const cardClass = "bg-[#0066b2] text-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-blue-900/10 border border-[#0066b2] relative overflow-hidden transition-all duration-500 hover:-translate-y-2 group h-full";

  const variants: Variants = {
      hidden: { opacity: 0, y: 30 },
      visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
              delay: i * 0.1,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
          }
      })
  };

  return (
    <section id="about" className="pt-12 md:pt-20 pb-24 md:pb-32 bg-white relative overflow-hidden">
      
      {/* Central Axis Continuity */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"></div>
      </div>

      {/* Tactical Board Markings (Centered on Axis) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
         {/* Center Circle */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] border-2 border-black rounded-full"></div>
         {/* Midfield Line */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-black"></div>
         {/* Outer Box */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border-2 border-black rounded-[2rem]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-20"
        >
            <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-blue-50 text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-8">Analisi Tattica</span>
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase leading-[1.2] mb-4">Non è solo <span className="text-slate-300">Calcio</span>.</h2>
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase leading-[1.2] mb-6">È <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-[#0066b2]">Identità</span>.</h2>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto"><strong className="text-black">Tacalabala</strong> riscrive le regole. Uniamo la tradizione di San Siro con l'estetica streetwear di Milano.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* CARD 1 */}
            <motion.div custom={0} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className={cardClass}>
                    <div className="absolute -right-6 -top-6 text-white opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none"><Trophy size={180} strokeWidth={1} /></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-10 shadow-inner">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <h3 className="text-white font-oswald text-3xl uppercase mb-6">DNA Vincente</h3>
                        <p className="text-blue-100 text-lg leading-relaxed font-light">Ispirati dalle notti europee e dagli scudetti. Ogni dettaglio racconta una vittoria, ogni cucitura una leggenda.</p>
                    </div>
                </div>
            </motion.div>

            {/* CARD 2 */}
            <motion.div custom={1} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className={cardClass}>
                    <div className="absolute -right-6 -top-6 text-white opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none"><Layers size={180} strokeWidth={1} /></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-10 shadow-inner">
                            <Layers size={40} className="text-white" />
                        </div>
                        <h3 className="text-white font-oswald text-3xl uppercase mb-6">Design Custom</h3>
                        <p className="text-blue-100 text-lg leading-relaxed font-light">Grafiche concettuali che rompono gli schemi. Non facciamo repliche, creiamo pezzi unici da collezione.</p>
                    </div>
                </div>
            </motion.div>

            {/* CARD 3 */}
            <motion.div custom={2} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className={cardClass}>
                    <div className="absolute -right-6 -top-6 text-white opacity-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none"><MapPin size={180} strokeWidth={1} /></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-10 shadow-inner">
                            <MapPin size={40} className="text-white" />
                        </div>
                        <h3 className="text-white font-oswald text-3xl uppercase mb-6">Made in Milano</h3>
                        <p className="text-blue-100 text-lg leading-relaxed font-light">Dalla Madonnina ai quartieri popolari. Portiamo l'eleganza e la grinta di Milano in ogni design.</p>
                    </div>
                </div>
            </motion.div>
            
        </div>
      </div>
    </section>
  );
};
export default About;
