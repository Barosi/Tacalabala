
import React, { useState } from 'react';
import { Product, Size } from '../types';
import { ShoppingBag, Loader2, Tag, Lock, Clock, Eye, AlertCircle, Check, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const { addToCart, calculatePrice } = useStore();
  
  // Logic for Future Drops
  const now = new Date();
  const dropDateObj = product.dropDate ? new Date(product.dropDate) : null;
  const isLocked = dropDateObj ? dropDateObj > now : false;

  const priceInfo = calculatePrice(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
      e.stopPropagation(); 
      e.preventDefault();
      setButtonState('loading');
      setTimeout(() => {
          addToCart(product, selectedSize);
          setButtonState('success');
          setTimeout(() => { setButtonState('idle'); }, 2000);
      }, 600); 
  };

  const currentVariant = product.variants?.find(v => v.size === selectedSize);
  const stockCount = currentVariant ? currentVariant.stock : 0;
  const isSizeSoldOut = stockCount === 0;
  const isPermanentlyDisabled = product.isSoldOut || isSizeSoldOut || isLocked;
  const isDisabled = isPermanentlyDisabled || buttonState !== 'idle';

  return (
    <div 
        onClick={isLocked ? undefined : onClick}
        className={`
            group relative bg-white border overflow-hidden transition-all duration-500 shadow-sm rounded-2xl h-full flex flex-col 
            ${isLocked ? 'border-slate-100 cursor-not-allowed' : 'border-slate-100 hover:border-[#0066b2] hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer'}
            ${product.isNewArrival && !isLocked ? 'ring-2 ring-purple-100' : ''}
        `}
    >
      
      {/* Top Bar Decoration */}
      <div className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-30 ${isLocked ? 'bg-slate-200' : 'bg-gradient-to-r from-black to-[#0066b2]'}`}></div>

      {/* SOLD OUT BADGE */}
      {product.isSoldOut && !isLocked && (
        <div className="absolute top-4 left-4 z-20 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">Sold Out</div>
      )}

      {/* NEW ARRIVAL BADGE */}
      {product.isNewArrival && !isLocked && !product.isSoldOut && (
         <div className="absolute top-4 left-4 z-20 bg-white text-purple-600 border border-purple-200 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
             <Star size={10} className="fill-purple-600 animate-pulse"/> New
         </div>
      )}

      {/* DISCOUNT BADGE */}
      {!product.isSoldOut && !isLocked && priceInfo.hasDiscount && (
          <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-xs font-bold px-4 py-2 uppercase tracking-widest rounded-full shadow-xl flex items-center gap-2">
              <Tag size={14} className="fill-white/20" /> -{priceInfo.discountPercent}%
          </div>
      )}

      {/* LOCKED BADGE (Top Right) */}
      {isLocked && (
           <div className="absolute top-4 right-4 z-20 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full flex items-center gap-2">
               <Lock size={10} /> Locked
           </div>
      )}

      {/* IMAGE SECTION */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 p-6">
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] pointer-events-none z-10 rounded-sm"></div>
        
        {/* Quick View Overlay hint (Only if unlocked) */}
        {!isLocked && (
            <div className="absolute inset-0 z-20 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-900 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                    <Eye size={14} /> Dettagli
                </div>
            </div>
        )}

        {/* LOCKED OVERLAY */}
        {isLocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl p-6 text-center">
                <div className="bg-slate-900 text-white p-4 rounded-full mb-4 shadow-2xl"><Lock size={32} /></div>
                <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 mb-2">Coming Soon</h4>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#0066b2] bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
                    <Clock size={12} /> Drop: {dropDateObj?.toLocaleDateString()}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-2">{dropDateObj?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
        )}

        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc("https://via.placeholder.com/400x500")}
          className={`
            w-full h-full object-contain drop-shadow-xl transition-transform duration-700 
            ${isLocked ? 'opacity-40 blur-sm scale-90 grayscale' : 'opacity-100 group-hover:scale-110 group-hover:-rotate-2'} 
            ${product.isSoldOut ? 'opacity-50 grayscale' : ''}
          `}
        />
      </div>

      <div className="p-8 flex flex-col flex-grow bg-white relative">
        
        {/* CENTERED SEASON LABEL + SIZE SELECTOR */}
        <div className="flex flex-col items-center gap-2 mb-4">
             {/* Edition Label Centered */}
            <span className="text-[#0066b2] text-[9px] font-bold uppercase tracking-[0.2em] text-center">
                {product.season}
            </span>
            
            {/* Size Selector - Centered Pills */}
            {!isLocked && (
                <div className="flex gap-1 bg-slate-100 rounded-full p-1" onClick={(e) => e.stopPropagation()}>
                    {(['S', 'M', 'L', 'XL'] as Size[]).map((s) => {
                        const variant = product.variants?.find(v => v.size === s);
                        const sizeDisabled = !variant || variant.stock === 0;
                        const isSelected = selectedSize === s;
                        
                        return (
                            <button
                                key={s}
                                disabled={sizeDisabled}
                                onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
                                className={`
                                    relative w-6 h-6 text-[10px] font-bold rounded-full flex items-center justify-center transition-all z-10
                                    ${sizeDisabled ? 'opacity-30 cursor-not-allowed line-through text-slate-400' : isSelected ? 'text-white' : 'text-slate-500 hover:text-black'}
                                `}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId={`size-card-${product.id}`}
                                        className="absolute inset-0 bg-[#0066b2] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {s}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
        
        <h3 className="text-black font-oswald text-2xl uppercase tracking-wide leading-tight mb-2 text-center group-hover:text-[#0066b2] transition-colors line-clamp-2">
          {isLocked ? '???' : product.title}
        </h3>
        
        <div className="min-h-[20px] mb-4 text-center">
             {!isLocked && (isSizeSoldOut ? (
                 <p className="text-[10px] text-red-500 font-bold uppercase inline-flex items-center gap-1"><AlertCircle size={12} /> Taglia Esaurita</p>
             ) : (
                 <p className="text-[10px] text-green-600 font-bold uppercase inline-flex items-center gap-1 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Disponibilità: {stockCount} pezzi</p>
             ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Prezzo</span>
                 {isLocked ? (
                     <span className="font-oswald font-bold text-xl text-slate-300">Locked</span>
                 ) : priceInfo.hasDiscount ? (
                     <div className="flex items-center gap-3">
                         <span className="text-red-600 font-oswald font-bold text-xl">€{priceInfo.finalPrice.toFixed(2)}</span>
                         <span className="text-slate-400 line-through text-sm">€{priceInfo.originalPrice}</span>
                     </div>
                 ) : (
                    <span className="text-slate-900 font-oswald font-bold text-xl">{product.price}</span>
                 )}
            </div>
            
            <button 
                onClick={handleAddToCart}
                disabled={isDisabled}
                className={`
                    relative overflow-hidden group/btn
                    px-6 py-3 rounded-full 
                    text-xs font-bold uppercase tracking-wider 
                    flex items-center justify-center gap-2 
                    transition-all duration-300 min-w-[130px] transform-gpu active:scale-95
                    border 
                    ${isPermanentlyDisabled
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' 
                        : buttonState === 'success'
                            ? 'bg-green-500 border-green-500 text-white shadow-md' 
                            : buttonState === 'loading'
                                ? 'bg-white border-[#0066b2] text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-[#0066b2] hover:text-white hover:shadow-lg hover:shadow-blue-900/20'
                    }
                `}
            >
                {!isPermanentlyDisabled && buttonState !== 'success' && (
                    <span className={`
                        absolute inset-0 bg-[#0066b2] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0
                        ${buttonState === 'loading' ? 'translate-y-0' : 'translate-y-full group-hover/btn:translate-y-0'}
                    `}></span>
                )}

                <span className="relative z-10 flex items-center gap-2">
                    {isLocked ? (
                        <><Lock size={14} /> Locked</>
                    ) : product.isSoldOut || isSizeSoldOut ? (
                        'Esaurita'
                    ) : buttonState === 'loading' ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : buttonState === 'success' ? (
                        <><Check size={16} /> Aggiunto</>
                    ) : (
                        <><ShoppingBag size={14} className="order-first" /> Aggiungi</>
                    )}
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
