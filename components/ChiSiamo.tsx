
import React from 'react';
import { PenTool, Shirt, Heart, User } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const ChiSiamo: React.FC = () => {
  // Varianti per l'animazione fluida
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  // Blue Card Style matching About.tsx
  const cardClass = "bg-[#0066b2] text-white border border-[#0066b2] p-8 md:p-12 rounded-[2rem] shadow-xl shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden";
  const bgIconClass = "absolute -right-6 -top-6 text-white opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none";

  return (
    <section id="about" className="pt-32 md:pt-48 pb-16 md:pb-24 overflow-hidden relative">
      
      {/* Background: Gradient matching Hero + Mesh Texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 z-0"></div>
      
      {/* Decorative Geometry for Depth (Breaks Uniformity) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Big Faded Circle Top Left */}
          <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full border border-slate-200 opacity-40"></div>
          {/* Big Faded Circle Bottom Right */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full border border-[#0066b2]/10 opacity-30"></div>
           {/* Center Axis */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-slate-200 border-l border-dashed border-slate-300"></div>
      </div>
      
      {/* Mesh Pattern Overlay - Slightly larger for better visibility */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{
          backgroundImage: `radial-gradient(#0066b2 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
      }}></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* --- HEADER & STORYTELLING --- */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center max-w-3xl mx-auto mb-20"
        >
             {/* Titolo con Leading corretto per evitare sovrapposizioni */}
             <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-8 text-slate-900 leading-[1.1] tracking-tight">
                In trasferta e <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">giù in Città</span>
             </h2>
             
             <div className="space-y-6 text-slate-600 text-lg md:text-xl font-light leading-relaxed">
                <p>
                    <strong className="text-slate-900 font-medium">Tacalabala</strong> non è solo un brand, è un manifesto d'appartenenza. Nati tra i gradoni di San Siro e cresciuti nelle strade di Milano, abbiamo sentito l'esigenza di colmare il vuoto tra la curva e la passerella.
                </p>
                <p>
                    La nostra missione è semplice ma ambiziosa: prendere l'estetica sacra della maglia nerazzurra e fonderla con i codici del design urbano contemporaneo. Non facciamo repliche, creiamo visioni.
                </p>
                <p>
                    Ogni cucitura racconta una trasferta, ogni grafica celebra una leggenda. Siamo indipendenti, siamo visionari, ma soprattutto, siamo tifosi.
                </p>
             </div>
        </motion.div>

        {/* --- VALUES CARDS (Total Blue) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            
            {/* Card 1 */}
            <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} 
                className={cardClass}
            >
                <div className={bgIconClass}><PenTool size={180} strokeWidth={1} /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                        <PenTool size={32} className="text-white" />
                    </div>
                    <h3 className="text-white font-oswald text-2xl uppercase mb-4">Design Unico</h3>
                    <p className="text-blue-100 text-base leading-relaxed font-light">Grafiche esclusive create dai nostri designer. Nessun template, solo pura creatività milanese.</p>
                </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} 
                className={cardClass}
                style={{ transitionDelay: '100ms' }}
            >
                <div className={bgIconClass}><Shirt size={180} strokeWidth={1} /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                        <Shirt size={32} className="text-white" />
                    </div>
                    <h3 className="text-white font-oswald text-2xl uppercase mb-4">Fit Moderno</h3>
                    <p className="text-blue-100 text-base leading-relaxed font-light">Taglio boxy e materiali premium. Perfetto per lo stadio, impeccabile per l'aperitivo.</p>
                </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} 
                className={cardClass}
                style={{ transitionDelay: '200ms' }}
            >
                <div className={bgIconClass}><Heart size={180} strokeWidth={1} /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                        <Heart size={32} className="text-white" />
                    </div>
                    <h3 className="text-white font-oswald text-2xl uppercase mb-4">Passione Pura</h3>
                    <p className="text-blue-100 text-base leading-relaxed font-light">Un tributo indipendente ai colori più belli del mondo. Fatto da tifosi, per tifosi.</p>
                </div>
            </motion.div>
        </div>

        {/* --- TEAM SECTION --- */}
        <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="border-t border-slate-100 pt-20"
        >
             <div className="text-center mb-16">
                 <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-blue-50 text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-4">Staff Tecnico</span>
                 <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase text-slate-900">La <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Formazione</span></h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* Team Member 1 */}
                <div className="group bg-white border border-slate-100 p-4 rounded-[2.5rem] hover:border-[#0066b2] transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5">
                    <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] mb-6 relative overflow-hidden flex items-center justify-center border border-slate-200 group-hover:bg-blue-50/50 transition-colors">
                        <div className="absolute inset-0 bg-jersey-mesh opacity-50"></div>
                        <User size={80} className="text-slate-300 group-hover:text-[#0066b2] transition-colors duration-500" strokeWidth={1} />
                    </div>
                    <div className="text-center pb-4">
                        <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 group-hover:text-[#0066b2] transition-colors">Alessandro Valli</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Founder & Creative Director</p>
                    </div>
                </div>

                {/* Team Member 2 */}
                <div className="group bg-white border border-slate-100 p-4 rounded-[2.5rem] hover:border-[#0066b2] transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5">
                    <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] mb-6 relative overflow-hidden flex items-center justify-center border border-slate-200 group-hover:bg-blue-50/50 transition-colors">
                         <div className="absolute inset-0 bg-jersey-mesh opacity-50"></div>
                         <User size={80} className="text-slate-300 group-hover:text-[#0066b2] transition-colors duration-500" strokeWidth={1} />
                    </div>
                    <div className="text-center pb-4">
                        <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 group-hover:text-[#0066b2] transition-colors">Davide Mariani</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Head of Operations</p>
                    </div>
                </div>

             </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ChiSiamo;
