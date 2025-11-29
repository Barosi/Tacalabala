import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PenTool, Shirt, Heart } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const About: React.FC = () => {
    const images = [
    "https://i.postimg.cc/cJk6R4gv/48d225ce96001f9fea2d9d8aa144e6c0.jpg", // Fashion/Street style
    "https://i.postimg.cc/rFsW33cm/resizedcrop-4e12ae0d97e764b44e55881caebf4edd-840x630.jpg", // Smoke/Atmosphere
  ];

  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === images.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    const slideInterval = setInterval(next, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Varianti per l'animazione fluida
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    // NOTA: pt-64 allinea questo componente con l'header delle altre pagine
    <section id="about" className="pt-64 pb-24 bg-white border-t border-slate-100 overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* HEADER: Stesso stile di Contatti e FAQ */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16"
        >
             <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                In trasferta e <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">giù in Città</span>
             </h2>
             <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-lg">
                Non seguiamo le regole del merchandising. Le riscriviamo.
             </p>
        </motion.div>

        {/* CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-8"
            >
                <div>
                
                    <p className="text-slate-600 leading-loose mb-4">
                        Tacalabala nasce per riempire il vuoto tra la curva e la passerella. 
                        <strong> Non vendiamo divise ufficiali da gara.</strong> Creiamo visioni: maglie <i>custom</i> e concept kit che fondono l'estetica calcistica con il design urbano.
                    </p>
                    <p className="text-slate-600 leading-loose">
                        Ogni pezzo è ispirato all'anima di Milano e ai colori nerazzurri, reinterpretati per chi vuole indossare la propria fede calcistica con uno stile unico, lontano dalle repliche commerciali.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100 mt-6">
                    <div className="flex flex-col gap-2 pt-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0066b2]">
                            <PenTool size={20} />
                        </div>
                        <h4 className="font-bold text-sm uppercase mt-2">Design Unico</h4>
                        <p className="text-xs text-slate-500">Grafiche esclusive create dai nostri designer.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0066b2]">
                            <Shirt size={20} />
                        </div>
                        <h4 className="font-bold text-sm uppercase mt-2">Fit Moderno</h4>
                        <p className="text-xs text-slate-500">Taglio streetwear perfetto per l'outfit quotidiano.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0066b2]">
                            <Heart size={20} />
                        </div>
                        <h4 className="font-bold text-sm uppercase mt-2">Ispirazione</h4>
                        <p className="text-xs text-slate-500">Tributo indipendente alla Milano nerazzurra.</p>
                    </div>
                </div>
            </motion.div>

            {/* Carousel Column */}
            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="relative"
            >
                {/* Decorative Element Behind */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0066b2]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-200/50 rounded-full blur-3xl"></div>

                <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-900/5 aspect-[4/3] group bg-white border border-slate-100">
                    <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full" style={{ transform: `translateX(-${curr * 100}%)` }}>
                        {images.map((img, i) => (
                            <img key={i} src={img} alt="Tacalabala Lifestyle" className="w-full h-full object-cover flex-shrink-0" />
                        ))}
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={prev} className="p-3 rounded-full bg-white/90 text-slate-900 shadow-xl hover:scale-110 transition-transform backdrop-blur-sm"><ChevronLeft size={20} /></button>
                        <button onClick={next} className="p-3 rounded-full bg-white/90 text-slate-900 shadow-xl hover:scale-110 transition-transform backdrop-blur-sm"><ChevronRight size={20} /></button>
                    </div>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${curr === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                        ))}
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;