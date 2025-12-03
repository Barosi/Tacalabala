
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { INSTAGRAM_URL } from '../constants';
import { ChevronLeft, ChevronRight, Instagram, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const { shippingConfig } = useStore();

  // Calcola quante card mostrare in base alla larghezza schermo (Desktop Logic)
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
    <section id="products" className="pt-12 md:pt-16 bg-white relative overflow-hidden scroll-mt-48 pb-0">
      
      {/* Central Axis Continuity with Fade Mask */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div 
            className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"
            style={{ 
                maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
            }}
          ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl mb-12 md:mb-24">
        
        {/* --- HEADER CENTRATO --- */}
        <div className="flex flex-col items-center justify-center mb-10 md:mb-16 gap-6 md:gap-8 text-center">
            
            {/* Blocco Titolo PULITO (Senza Box) */}
            <div className="flex flex-col items-center relative z-10">
                <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-white text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-4 md:mb-6">
                    Drop Ufficiale
                </span>
                <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase leading-none text-slate-900">
                    Le Nostre <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Creazioni</span>
                </h2>
            </div>

            {/* Bottone Gallery NEW DESIGN */}
            <a 
                href={INSTAGRAM_URL} 
                target="_blank" 
                rel="noreferrer" 
                className="
                    relative overflow-hidden group/btn
                    bg-white text-slate-900 border border-slate-200 
                    py-3 px-4 md:px-8 rounded-full 
                    text-xs uppercase tracking-[0.2em] font-bold 
                    flex items-center gap-3 
                    shadow-sm hover:shadow-xl hover:shadow-blue-900/20 hover:border-[#0066b2] hover:text-white
                    transition-all duration-300 transform-gpu active:scale-95
                "
            >
                <span className="absolute inset-0 bg-[#0066b2] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></span>
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                    <Instagram size={20} /> <span className="hidden md:inline">Vedi Gallery</span>
                </span>
            </a>
        </div>

        {/* --- CAROUSEL CONTAINER --- */}
        <div className="relative group/carousel">
            
            {/* DESKTOP VIEW: FRAMER MOTION SLIDER */}
            <div className="hidden md:block overflow-hidden py-4 -my-4 px-1 -mx-1">
                 {products.length > itemsPerPage && (
                    <>
                        <button onClick={prevSlide} className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"><ChevronLeft size={24} /></button>
                        <button onClick={nextSlide} className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-[#0066b2] hover:text-white hover:border-[#0066b2] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"><ChevronRight size={24} /></button>
                    </>
                )}
                <motion.div 
                    className="flex gap-8"
                    initial={false}
                    animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[calc(33.333%-1.33rem)]">
                            <div className="h-full transform transition-transform hover:scale-[1.01] duration-300">
                                <ProductCard product={product} onClick={() => onProductClick?.(product)} />
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* MOBILE VIEW: NATIVE SNAP SCROLLING (FLUID) */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-8 -mx-6 px-6 no-scrollbar">
                {products.map((product) => (
                    <div key={product.id} className="snap-center flex-shrink-0 w-[85vw]">
                        <ProductCard product={product} onClick={() => onProductClick?.(product)} />
                    </div>
                ))}
            </div>

            {/* Indicatori (Dots) - Desktop Only */}
            <div className="hidden md:flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(products.length / itemsPerPage) + (itemsPerPage > 1 ? 1 : 0) }).slice(0, Math.max(1, products.length - itemsPerPage + 1)).map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#0066b2] w-8' : 'bg-slate-200 w-2 hover:bg-slate-300'}`} 
                    />
                ))}
            </div>
        </div>
      </div>

      {/* --- TRUST SIGNALS: ESSENTIAL & CLEAN --- */}
      <div className="w-full bg-[#0066b2] text-white py-16 relative z-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
                <div className="flex flex-col items-center justify-center">
                    <Truck size={32} strokeWidth={1} className="text-blue-200 mb-4" />
                    <h4 className="font-oswald text-lg font-bold uppercase tracking-widest mb-1">Spedizione Gratis</h4>
                    <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest opacity-60">Ordini sopra i €{shippingConfig.italyThreshold}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <RefreshCw size={32} strokeWidth={1} className="text-blue-200 mb-4" />
                    <h4 className="font-oswald text-lg font-bold uppercase tracking-widest mb-1">Reso Facile</h4>
                    <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest opacity-60">14 Giorni di tempo</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <ShieldCheck size={32} strokeWidth={1} className="text-blue-200 mb-4" />
                    <h4 className="font-oswald text-lg font-bold uppercase tracking-widest mb-1">Pagamenti Sicuri</h4>
                    <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest opacity-60">SSL & Carte di Credito</p>
                </div>
            </div>
          </div>
      </div>

    </section>
  );
};
export default ProductGrid;
