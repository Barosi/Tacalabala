
import React, { useState, useEffect } from 'react';
import { Product, Size } from '../types';
import { useStore } from '../store/useStore';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Ruler, Check, Heart, Share2 } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onCheckout: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onCheckout }) => {
  const { addToCart, calculatePrice } = useStore();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const priceInfo = calculatePrice(product);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setIsAdding(true);
    addToCart(product, selectedSize);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const currentVariant = product.variants?.find(v => v.size === selectedSize);
  const stockCount = currentVariant ? currentVariant.stock : 0;
  const isSoldOut = product.isSoldOut || (selectedSize && stockCount === 0);

  return (
    <section className="pt-32 md:pt-48 pb-24 bg-white min-h-screen relative animate-in fade-in duration-500">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0066b2] font-bold uppercase text-[10px] tracking-widest transition-colors">
                <ArrowLeft size={14} /> Torna allo Store
            </button>
            <div className="flex gap-4">
                <button className="text-slate-400 hover:text-red-500 transition-colors"><Heart size={20} /></button>
                <button className="text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={20} /></button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left: Image Gallery */}
            <div className="space-y-4">
                <div className="relative bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm aspect-[4/5] lg:aspect-square group">
                    <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-contain p-8 md:p-16 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1" 
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        {product.isSoldOut && <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Sold Out</span>}
                        {priceInfo.hasDiscount && <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Sale -{priceInfo.discountPercent}%</span>}
                    </div>
                </div>

                {/* Thumbnail Grid (Mocked for visual structure since we have 1 image per product in data) */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 aspect-square p-2 cursor-pointer hover:border-[#0066b2] transition-colors"><img src={product.imageUrl} className="w-full h-full object-contain" alt="" /></div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 aspect-square p-2 cursor-pointer hover:border-[#0066b2] transition-colors opacity-50 hover:opacity-100"><img src={product.imageUrl} className="w-full h-full object-contain grayscale hover:grayscale-0" alt="" /></div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 aspect-square p-2 cursor-pointer hover:border-[#0066b2] transition-colors opacity-50 hover:opacity-100"><img src={product.imageUrl} className="w-full h-full object-contain grayscale hover:grayscale-0" alt="" /></div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 aspect-square p-2 cursor-pointer hover:border-[#0066b2] transition-colors opacity-50 hover:opacity-100 flex items-center justify-center text-slate-300 font-bold text-xs">+</div>
                </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col h-full py-4">
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-center mb-6">
                        <span className="inline-block px-4 py-1 border border-slate-200 rounded-full text-[#0066b2] font-bold uppercase tracking-[0.2em] text-[10px]">
                            {product.season}
                        </span>
                    </div>

                    {/* Fixed Title: Removed truncate, added break-words, adjusted size/leading */}
                    <h1 className="font-oswald text-3xl md:text-5xl font-bold uppercase text-slate-900 leading-tight mb-4 break-words w-full" title={product.title}>
                        {product.title}
                    </h1>
                    
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-6">{product.brand || 'Tacalabala Authentic'}</p>

                    <div className="flex items-center gap-4">
                        {priceInfo.hasDiscount ? (
                            <div className="flex items-baseline gap-3">
                                <span className="font-oswald font-bold text-3xl md:text-4xl text-red-600">€{priceInfo.finalPrice.toFixed(2)}</span>
                                <span className="font-oswald font-medium text-xl text-slate-400 line-through">€{priceInfo.originalPrice}</span>
                            </div>
                        ) : (
                            <span className="font-oswald font-bold text-3xl md:text-4xl text-slate-900">{product.price}</span>
                        )}
                    </div>
                </div>

                {/* Size Selector */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase text-slate-900 tracking-wide">Seleziona Taglia</span>
                        <button className="text-[10px] font-bold uppercase text-[#0066b2] flex items-center gap-1 hover:underline"><Ruler size={12} /> Guida Taglie</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {['S', 'M', 'L', 'XL'].map((s) => {
                             const variant = product.variants?.find(v => v.size === s);
                             const disabled = !variant || variant.stock === 0;
                             return (
                                <button
                                    key={s}
                                    disabled={disabled}
                                    onClick={() => setSelectedSize(s as Size)}
                                    className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 border
                                        ${selectedSize === s 
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                                            : disabled 
                                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through' 
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#0066b2] hover:text-[#0066b2]'}
                                    `}
                                >
                                    {s}
                                </button>
                             )
                        })}
                    </div>
                    {selectedSize && !isSoldOut && (
                        <p className="mt-3 text-[10px] font-bold uppercase text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Disponibilità Immediata
                        </p>
                    )}
                </div>

                {/* Actions - UPDATED BUTTON STYLE TO MATCH GLOBAL */}
                <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-10">
                    <button 
                        onClick={handleAddToCart}
                        disabled={!selectedSize || isSoldOut}
                        className={`
                            relative overflow-hidden group/btn 
                            px-10 py-4 rounded-full 
                            font-bold uppercase tracking-widest text-xs 
                            flex items-center justify-center gap-3 
                            transition-all duration-300 w-auto min-w-[200px]
                            transform-gpu active:scale-95
                            border
                            ${isAdding 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : (!selectedSize || isSoldOut)
                                    ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-white border-slate-900 text-slate-900 hover:text-white shadow-lg hover:shadow-xl hover:shadow-slate-900/20'}
                        `}
                    >
                         {/* Liquid Background Effect for Normal State */}
                         {(!isAdding && selectedSize && !isSoldOut) && (
                            <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                         )}

                         <span className="relative z-10 flex items-center gap-2">
                             {isAdding ? <Check size={18} /> : <ShoppingBag size={18} />}
                             {isAdding ? 'Aggiunto' : isSoldOut ? 'Esaurito' : 'Aggiungi al carrello'}
                         </span>
                    </button>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <h3 className="font-oswald text-xl uppercase font-bold text-slate-900">Dettagli Prodotto</h3>
                    <p className="text-slate-600 leading-relaxed font-light text-base">
                        {product.description || "Descrizione dettagliata del prodotto non disponibile. Tessuto di alta qualità, design esclusivo Tacalabala."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <Truck className="text-[#0066b2]" size={20} />
                             <div>
                                 <p className="font-bold text-slate-900 text-xs uppercase">Spedizione 24h</p>
                                 <p className="text-[10px] text-slate-500">Corriere Espresso</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <ShieldCheck className="text-[#0066b2]" size={20} />
                             <div>
                                 <p className="font-bold text-slate-900 text-xs uppercase">100% Autentico</p>
                                 <p className="text-[10px] text-slate-500">Garanzia Qualità</p>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
