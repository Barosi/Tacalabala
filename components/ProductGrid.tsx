
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { INSTAGRAM_URL } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  // Calcola quante card mostrare in base alla larghezza schermo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const nextSlide = () => {
    if (currentIndex < maxIndex) setCurrentIndex(prev => prev + 1);
    else setCurrentIndex(0); // Loop back to start
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    else setCurrentIndex(maxIndex); // Loop to end
  };
  
  return (
    <section id="collection" className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Central Axis Continuity */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"></div>
      </div>

      {/* Background Pattern Sottile */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(#0066b2 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
      }}></div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- HEADER CENTRATO --- */}
        <div className="flex flex-col items-center justify-center mb-16 gap-8 text-center">
            
            {/* Blocco Titolo PULITO (Senza Box) */}
            <div className="flex flex-col items-center relative z-10">
                <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-white text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-6">
                    Drop Ufficiale
                </span>
                <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase leading-none text-slate-900">
                    Le Nostre <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Creazioni</span>
                </h2>
            </div>

            {/* Bottone Gallery Sotto il Titolo */}
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-slate-500 hover:text-black transition-colors text-xs uppercase tracking-[0.2em] font-bold py-3 bg-white/60 backdrop-blur-sm px-6 rounded-full border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-lg transition-all">
                Vedi Gallery
                <span className="bg-white border border-slate-200 p-1.5 rounded-full group-hover:bg-[#0066b2] group-hover:border-[#0066b2] group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
            </a>
        </div>

        {/* --- CAROUSEL CONTAINER --- */}
        {/* Changed 'group' to 'group/carousel' to isolate hover effects from ProductCard */}
        <div className="relative group/carousel">
            
            {/* Navigazione Frecce (Ai lati, centrate verticalmente) */}
            {products.length > itemsPerPage && (
                <>
                    <button 
                        onClick={prevSlide} 
                        className="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
                        title="Precedente"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={nextSlide} 
                        className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
                        title="Successivo"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Finestra di visualizzazione (Overflow Hidden) */}
            <div className="overflow-hidden py-4 -my-4 px-1 -mx-1" ref={carouselRef}>
                <motion.div 
                    className="flex gap-8"
                    initial={false}
                    animate={{ 
                        x: `-${currentIndex * (100 / itemsPerPage)}%` 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                    drag="x"
                    dragConstraints={carouselRef}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) nextSlide();
                        else if (swipe > 50) prevSlide();
                    }}
                >
                    {products.map((product) => (
                        <motion.div 
                            key={product.id}
                            className={`flex-shrink-0 
                                w-full 
                                md:w-[calc(50%-1rem)] 
                                lg:w-[calc(33.333%-1.33rem)]
                            `}
                        >
                            <div className="h-full transform transition-transform hover:scale-[1.01] duration-300">
                                <ProductCard product={product} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Indicatori (Dots) in basso */}
            {products.length > itemsPerPage && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(products.length / itemsPerPage) + (itemsPerPage > 1 ? 1 : 0) }).slice(0, Math.max(1, products.length - itemsPerPage + 1)).map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#0066b2] w-8' : 'bg-slate-200 w-2 hover:bg-slate-300'}`} 
                        />
                    ))}
                </div>
            )}
        </div>

      </div>
    </section>
  );
};
export default ProductGrid;
