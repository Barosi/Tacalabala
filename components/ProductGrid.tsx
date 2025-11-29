
import React, { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { INSTAGRAM_URL } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  
  const itemsPerPage = 3;
  const isCarouselActive = products.length > 3;

  useEffect(() => { setStartIndex(0); }, [products.length]);

  const nextSlide = () => { if (startIndex + 1 < products.length) setStartIndex(prev => prev + 1); else setStartIndex(0); };
  const prevSlide = () => { if (startIndex > 0) setStartIndex(prev => prev - 1); else setStartIndex(Math.max(0, products.length - itemsPerPage)); };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            entry.target.classList.remove('reveal-hidden');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const elements = sectionRef.current?.querySelectorAll('.reveal-hidden');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products, startIndex]);
  
  const getVisibleProducts = () => {
    if (!isCarouselActive) return products;
    return products.slice(startIndex, startIndex + 3);
  };
  
  const displayedProducts = getVisibleProducts();

  return (
    <section id="collection" ref={sectionRef} className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Central Axis Continuity */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"></div>
      </div>
      
      {/* Horizontal Grid Lines (Pitch Map Effect) */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
           <div className="w-full h-px bg-slate-400"></div>
           <div className="w-full h-px bg-slate-400"></div>
           <div className="w-full h-px bg-slate-400"></div>
           <div className="w-full h-px bg-slate-400"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 reveal-hidden transition-reveal">
          <div>
            <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-blue-50 text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-4">Drop Ufficiale</span>
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-black to-[#0066b2]">Le Nostre <br/> Creazioni</h2>
          </div>
          <div className="flex flex-col items-end gap-6">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-slate-500 hover:text-black transition-colors text-xs uppercase tracking-[0.2em] font-bold py-2">
                Vedi Gallery
                <span className="bg-white border border-slate-200 p-2 rounded-full group-hover:bg-[#0066b2] group-hover:border-[#0066b2] group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </a>

              {/* Carousel Controls */}
              {isCarouselActive && (
                  <div className="flex gap-3">
                      <button onClick={prevSlide} className="p-4 rounded-full bg-white border border-slate-200 hover:border-[#0066b2] hover:text-[#0066b2] transition-all shadow-sm active:scale-95"><ChevronLeft size={20} /></button>
                      <button onClick={nextSlide} className="p-4 rounded-full bg-white border border-slate-200 hover:border-[#0066b2] hover:text-[#0066b2] transition-all shadow-sm active:scale-95"><ChevronRight size={20} /></button>
                  </div>
              )}
          </div>
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto`}>
          {displayedProducts.map((product, index) => (
            <div key={product.id} className="reveal-hidden transition-reveal h-full" style={{ transitionDelay: `${index * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {isCarouselActive && (
            <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: Math.max(1, products.length - 2) }).map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === startIndex ? 'bg-[#0066b2] w-8' : 'bg-slate-300 w-2'}`} />
                ))}
            </div>
        )}
      </div>
    </section>
  );
};
export default ProductGrid;
