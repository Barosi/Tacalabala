
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useStore } from '../store/useStore';
import { Filter, SlidersHorizontal, ChevronDown, Check, Ruler, Layers, SortAsc, SortDesc, Calendar } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'framer-motion';

interface StoreProps {
  onProductClick?: (product: Product) => void;
}

const Store: React.FC<StoreProps> = ({ onProductClick }) => {
  const { products } = useStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'new' | 'price-asc' | 'price-desc'>('new');
  
  // Custom Streetwear categories
  const categories = ['Concept', 'Lifestyle', 'Vintage', 'Limited'];
  
  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL'];

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
        if (filterType === 'all') return true;
        // Mock filtering logic
        if (filterType === 'Concept') return p.tags?.includes('Concept') || p.kitType === 'Special';
        if (filterType === 'Lifestyle') return p.tags?.includes('Lifestyle') || p.season.includes('Lifestyle');
        if (filterType === 'Vintage') return p.year && parseInt(p.year) < 2010;
        return true; 
    })
    .filter(p => {
        if (filterSize === 'all') return true;
        return p.variants?.some(v => v.size === filterSize && v.stock > 0);
    })
    .sort((a, b) => {
        if (sortBy === 'price-asc') return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
        if (sortBy === 'price-desc') return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
        return parseInt(b.id) - parseInt(a.id); // Default new
    });

  const handleReset = () => {
    setFilterType('all');
    setFilterSize('all');
  };

  return (
    <section className="pt-32 md:pt-48 pb-24 bg-white min-h-screen relative overflow-hidden">
       
       {/* BACKGROUND: Pitch Lines + Central Fade */}
       <div className="absolute inset-0 pointer-events-none z-0">
           {/* Center Circle Graphic */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-100 rounded-full opacity-60"></div>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-slate-100 rounded-full"></div>
            
            {/* Axis Line with Gradient Fade */}
            <div className="absolute inset-0 flex justify-center">
                <div 
                    className="w-px h-full bg-slate-200 border-l border-dashed border-slate-300"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}
                ></div>
            </div>
            
            {/* Horizontal Line (Midfield) */}
            <div className="absolute top-1/3 left-0 w-full h-px bg-slate-100"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header - Styled like Chi Siamo & FAQ */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
        >
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-4 text-slate-900 leading-[1.1]">
                Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Shop</span>
            </h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">La collezione completa</p>
        </motion.div>

        {/* Filters Toolbar */}
        <div className="flex flex-col mb-12 sticky top-28 z-30 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
            
            {/* Top Row: Sorting (Left aligned) */}
            <div className="flex items-center gap-4 mb-6">
                 <div className="flex items-center gap-2 text-[#0066b2]">
                    <SlidersHorizontal size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ordina per</span>
                 </div>
                 <div className="relative group">
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-8 text-xs font-bold uppercase tracking-wide text-slate-700 outline-none focus:border-[#0066b2] cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <option value="new">Novità</option>
                        <option value="price-asc">Prezzo: Basso - Alto</option>
                        <option value="price-desc">Prezzo: Alto - Basso</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Filter Rows: Collection & Size Inline */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-8 w-full">
                
                {/* 1. Collezione Filter */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 min-w-fit">
                        <Layers size={12} /> Collezione
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {/* 'View All' Removed as requested */}
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${filterType === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0066b2]'}`}
                        >
                            Tutte
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterType(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${filterType === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0066b2]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vertical Divider (Visible on XL) */}
                <div className="hidden xl:block h-8 w-px bg-slate-200 border-l border-dashed border-slate-300"></div>

                {/* 2. Size Filter (Next to Collection) */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 min-w-fit">
                        <Ruler size={12} /> Taglia
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <button
                             onClick={() => setFilterSize('all')}
                             className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 border ${filterSize === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-[#0066b2]'}`}
                             title="Qualsiasi Taglia"
                        >
                            <Check size={16} />
                        </button>
                        {availableSizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setFilterSize(size)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 border ${filterSize === size ? 'bg-[#0066b2] text-white border-[#0066b2] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-[#0066b2]'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nessun prodotto corrisponde ai filtri.</p>
                <button onClick={handleReset} className="mt-4 text-[#0066b2] text-xs font-bold uppercase border-b border-[#0066b2] pb-0.5 hover:text-slate-900 hover:border-slate-900 transition-all">
                    Reset Filtri
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-12">
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
