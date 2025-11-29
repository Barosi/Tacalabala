
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const ChiSiamo: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200", // Stadium vibe
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200", // Texture
    "https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?q=80&w=1200"  // Football
  ];

  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === images.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    const slideInterval = setInterval(next, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="pt-64 pb-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16">
             <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                La Nostra <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Storia</span>
             </h2>
             <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Nati dalla passione per i colori nerazzurri, siamo un collettivo di designer e tifosi che vuole portare lo stile di San Siro nelle strade di tutto il mondo.
             </p>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
                <h3 className="font-oswald text-3xl font-bold uppercase text-slate-900">Oltre il 90° minuto</h3>
                <p className="text-slate-600 leading-loose">
                    Tacalabala non è solo un negozio, è un tributo alla cultura calcistica milanese. Ogni maglia che disegniamo o selezioniamo racconta una storia di gloria, sofferenza e trionfo.
                </p>
                <p className="text-slate-600 leading-loose">
                    Crediamo che la maglia da calcio sia l'ultimo vero vessillo tribale moderno. Per questo la trattiamo con il rispetto di un'opera d'arte e la grinta dello streetwear contemporaneo.
                </p>
                <div className="pt-4">
                    <span className="inline-block bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                        Est. 2024 • Milano
                    </span>
                </div>
            </div>

            {/* Custom Carousel */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-900/10 aspect-[4/3] group">
                <div className="flex transition-transform duration-700 ease-out h-full" style={{ transform: `translateX(-${curr * 100}%)` }}>
                    {images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full h-full object-cover flex-shrink-0" />
                    ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={prev} className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg"><ChevronLeft size={24} /></button>
                    <button onClick={next} className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-lg"><ChevronRight size={24} /></button>
                </div>
                <div className="absolute bottom-4 right-0 left-0">
                    <div className="flex items-center justify-center gap-2">
                        {images.map((_, i) => (
                            <div key={i} className={`transition-all w-2 h-2 rounded-full ${curr === i ? "p-1 bg-white" : "bg-white/50"}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ChiSiamo;
