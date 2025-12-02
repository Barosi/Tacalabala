
import React from 'react';
import { MapPin, Trophy, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  
  return (
    <section id="about" className="pt-16 pb-24 bg-[#0066b2] relative overflow-hidden">
      
      {/* Sfondo Campo da Calcio (Pitch Lines) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Rumore di fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-30"></div>
          
          {/* Cerchio di Centrocampo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full"></div>
          
          {/* Linea di Metà Campo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20"></div>
          
          {/* Area Grande (Top) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[200px] border-b-2 border-l-2 border-r-2 border-white/10 rounded-b-3xl"></div>
          
          {/* Area Grande (Bottom) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[200px] border-t-2 border-l-2 border-r-2 border-white/10 rounded-t-3xl"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* HEADER CENTRALE */}
        <div className="text-center mb-20">
            {/* Pillola Analisi Tattica (Invertita) */}
            <div className="inline-block mb-8">
                <span className="py-1.5 px-6 border border-white rounded-full bg-white text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase shadow-lg">
                    Analisi Tattica
                </span>
            </div>

            {/* Titolo Typography Corrected Spacing & Colors - Separation Logic Fixed */}
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase text-white mb-8 leading-tight">
                <span className="block mb-4">NON È SOLO <span className="text-blue-200 opacity-80">CALCIO</span>.</span>
                <span className="text-white drop-shadow-md block">È IDENTITÀ.</span>
            </h2>

            <p className="text-blue-100 text-lg font-light max-w-2xl mx-auto leading-relaxed">
                Tacalabala riscrive le regole. Uniamo la tradizione di San Siro con l'estetica streetwear di Milano.
            </p>
        </div>

        {/* 3 CARD STYLE "FORMAZIONE" MA BLU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* CARD 1 */}
            <motion.div 
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/20 border border-transparent relative overflow-hidden group text-center flex flex-col items-center"
            >
                {/* Background Icon (Faded Blue) */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity text-[#0066b2]">
                    <Trophy size={140} strokeWidth={0.5} />
                </div>

                {/* Icon Box (Blue) */}
                <div className="w-16 h-16 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Trophy size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900 mb-4 tracking-wide group-hover:text-[#0066b2] transition-colors">DNA Vincente</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                    Ispirati dalle notti europee e dagli scudetti. Ogni dettaglio racconta una vittoria, ogni cucitura una leggenda.
                </p>
            </motion.div>

            {/* CARD 2 */}
            <motion.div 
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/20 border border-transparent relative overflow-hidden group text-center flex flex-col items-center"
            >
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity text-[#0066b2]">
                    <Layers size={140} strokeWidth={0.5} />
                </div>

                <div className="w-16 h-16 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Layers size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900 mb-4 tracking-wide group-hover:text-[#0066b2] transition-colors">Design Custom</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                    Grafiche concettuali che rompono gli schemi. Non facciamo repliche, creiamo pezzi unici da collezione.
                </p>
            </motion.div>

            {/* CARD 3 */}
            <motion.div 
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/20 border border-transparent relative overflow-hidden group text-center flex flex-col items-center"
            >
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity text-[#0066b2]">
                    <MapPin size={140} strokeWidth={0.5} />
                </div>

                <div className="w-16 h-16 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900 mb-4 tracking-wide group-hover:text-[#0066b2] transition-colors">Made in Milano</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                    Dalla Madonnina ai quartieri popolari. Portiamo l'eleganza e la grinta di Milano in ogni design.
                </p>
            </motion.div>

        </div>
      </div>
    </section>
  );
};
export default About;
