
import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useStore } from '../store/useStore';
import { Filter, Check } from 'lucide-react';
import { Product } from '../types';
import { motion, LayoutGroup } from 'framer-motion';

interface StoreProps {
  onProductClick?: (product: Product) => void;
}

// Componente isolato per i segmenti di filtro
const StoreSegmentedControl = ({ 
    options, 
    value, 
    onChange, 
    uniqueKey,
    isCircle = false
}: { 
    options: { value: string, label: string | React.ReactNode }[], 
    value: string, 
    onChange: (val: string) => void, 
    uniqueKey: string,
    isCircle?: boolean
}) => {
    return (
        <LayoutGroup id={uniqueKey}>
            <div className={`flex items-center ${isCircle ? 'gap-3' : 'gap-1'} p-1`}>
                {options.map((opt) => {
                    const isActive = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            className={`
                                relative 
                                ${isCircle ? 'w-10 h-10 rounded-full border border-slate-200' : 'px-4 md:px-5 py-2.5 rounded-full min-w-fit md:min-w-[70px]'}
                                text-[10px] font-bold uppercase tracking-widest z-10 flex items-center justify-center
                                transition-all duration-300 outline-none whitespace-nowrap
                                ${isActive ? (isCircle ? 'bg-slate-900 text-white border-slate-900' : 'text-white') : 'text-slate-500 hover:text-[#0066b2]'}
                                ${isCircle && !isActive ? 'bg-white' : ''}
                            `}
                        >
                            {!isCircle && isActive && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-[#0066b2] rounded-full shadow-md"
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    style={{ zIndex: -1 }}
                                />
                            )}
                            <span className="relative z-10">{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </LayoutGroup>
    );
};

const Store: React.FC<StoreProps> = ({ onProductClick }) => {
  const { products } = useStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  
  // Custom Streetwear categories
  const categories = ['Concept', 'Lifestyle', 'Vintage', 'Limited'];
  
  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL'];

  // Filter Logic Memoized for Performance
  const filteredProducts = useMemo(() => {
      return products
        .filter(p => {
            if (filterType === 'all') return true;
            if (filterType === 'Concept') return p.tags?.includes('Concept') || p.kitType === 'Special';
            if (filterType === 'Lifestyle') return p.tags?.includes('Lifestyle') || p.season.includes('Lifestyle');
            if (filterType === 'Vintage') return p.year && parseInt(p.year) < 2010;
            return true; 
        })
        .filter(p => {
            if (filterSize === 'all') return true;
            return p.variants?.some(v => v.size === filterSize && v.stock > 0);
        })
        .sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }, [products, filterType, filterSize]);

  const handleReset = () => {
    setFilterType('all');
    setFilterSize('all');
  };

  const collectionOptions = [
      { value: 'all', label: 'Tutte' },
      ...categories.map(c => ({ value: c, label: c }))
  ];

  const sizeOptions = [
      { value: 'all', label: <Check size={14} /> },
      ...availableSizes.map(s => ({ value: s, label: s }))
  ];

  return (
    <section className="pt-36 md:pt-48 pb-24 bg-white min-h-screen relative overflow-hidden">
       
       {/* BACKGROUND: Pitch Lines + Central Fade */}
       <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-100 rounded-full opacity-60"></div>
            <div className="absolute inset-0 flex justify-center">
                <div 
                    className="w-px h-full bg-slate-200 border-l border-dashed border-slate-300"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
                ></div>
            </div>
            <div className="absolute top-1/3 left-0 w-full h-px bg-slate-100"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-10"
        >
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-4 text-slate-900 leading-[1.1]">
                Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Shop</span>
            </h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">La collezione completa</p>
        </motion.div>

        {/* --- TOOLBAR (Sticky) --- */}
        <div className="sticky top-28 md:top-24 z-30 mb-8 md:mb-12 transition-all duration-300">
            
            {/* DESKTOP VIEW: Unified Glass Pill */}
            <div className="hidden md:flex justify-center w-full">
                <div className="overflow-x-auto no-scrollbar py-2 px-4">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 p-2 rounded-full shadow-lg shadow-slate-200/50 min-w-max mx-auto">
                        <StoreSegmentedControl 
                            options={collectionOptions} 
                            value={filterType} 
                            onChange={setFilterType} 
                            uniqueKey="desktop-collection-filter" 
                        />
                        <div className="w-px h-8 bg-slate-200 mx-1"></div>
                        <StoreSegmentedControl 
                            options={sizeOptions} 
                            value={filterSize} 
                            onChange={setFilterSize} 
                            uniqueKey="desktop-size-filter" 
                        />
                    </div>
                </div>
            </div>

            {/* MOBILE VIEW: Text Pills + Circles (Scrollable) */}
            <div className="md:hidden flex flex-col gap-4 w-full pb-2">
                
                {/* Row 1: Categories (Text Pills - Horizontal Scroll) */}
                <div className="flex overflow-x-auto overflow-y-hidden no-scrollbar gap-2 px-4 w-full snap-x items-center touch-pan-x overscroll-x-contain py-2">
                    {[{value: 'all', label: 'Tutti'}, ...categories.map(c => ({value: c, label: c}))].map((opt) => {
                         const isActive = filterType === opt.value;
                         return (
                             <button
                                key={opt.value}
                                onClick={() => setFilterType(opt.value)}
                                className={`
                                    flex-shrink-0 snap-start
                                    px-5 py-2.5 rounded-full 
                                    text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                                    whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                                        : 'bg-white text-slate-500 border-slate-200'}
                                `}
                            >
                                {opt.label}
                            </button>
                         )
                    })}
                </div>

                {/* Row 2: Sizes (Circles - Horizontal Scroll) */}
                <div className="flex overflow-x-auto overflow-y-hidden no-scrollbar gap-3 px-4 w-full items-center snap-x touch-pan-x overscroll-x-contain py-2">
                    {sizeOptions.map((opt) => {
                        const isActive = filterSize === opt.value;
                        return (
                             <button
                                key={opt.value}
                                onClick={() => setFilterSize(opt.value)}
                                className={`
                                    flex-shrink-0 snap-start
                                    w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all border
                                    ${isActive 
                                        ? 'bg-[#0066b2] text-white border-[#0066b2] shadow-md shadow-blue-500/30' 
                                        : 'bg-white text-slate-400 border-slate-200'}
                                `}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

            </div>

        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
                <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nessun prodotto corrisponde ai filtri.</p>
                <button onClick={handleReset} className="mt-4 text-[#0066b2] text-xs font-bold uppercase border-b border-[#0066b2] pb-0.5 hover:text-slate-900 hover:border-slate-900 transition-all">
                    Reset Filtri
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {filteredProducts.map(product => (
                    <div key={product.id} className="h-full">
                        <ProductCard product={product} onClick={() => onProductClick?.(product)} />
                    </div>
                ))}
            </div>
        )}

      </div>
    </section>
  );
};

export default Store;
