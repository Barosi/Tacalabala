
import React, { useState } from 'react';
import { Product, Size } from '../types';
import { ShoppingBag, Shirt, AlertCircle, Check, Loader2, Tag, Lock, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const { addToCart, calculatePrice } = useStore();
  
  // Logic for Coming Soon / Drop
  const isComingSoon = product.dropDate && new Date(product.dropDate) > new Date();
  const dropDateObj = product.dropDate ? new Date(product.dropDate) : null;

  const priceInfo = calculatePrice(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      setIsAdding(true);
      setTimeout(() => {
          addToCart(product, selectedSize);
          setIsAdding(false);
          setIsAdded(true);
          setTimeout(() => { setIsAdded(false); }, 2000);
      }, 500);
  };

  const currentVariant = product.variants?.find(v => v.size === selectedSize);
  const stockCount = currentVariant ? currentVariant.stock : 0;
  const isSizeSoldOut = stockCount === 0;

  return (
    <div className="group relative bg-white border border-slate-100 overflow-hidden hover:border-[#0066b2] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 rounded-2xl h-full flex flex-col">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-[#0066b2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-30"></div>

      {product.isSoldOut && !isComingSoon && (
        <div className="absolute top-4 left-4 z-20 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">Sold Out</div>
      )}

      {!product.isSoldOut && !isComingSoon && priceInfo.hasDiscount && (
          <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-xs font-bold px-4 py-2 uppercase tracking-widest rounded-full shadow-xl flex items-center gap-2">
              <Tag size={14} className="fill-white/20" /> -{priceInfo.discountPercent}%
          </div>
      )}

      {/* IMAGE SECTION WITH COMING SOON LOGIC */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 p-6">
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] pointer-events-none z-10 rounded-sm"></div>
        
        {isComingSoon && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md p-6 text-center">
                <div className="bg-black text-white p-4 rounded-full mb-4 shadow-xl"><Lock size={32} /></div>
                <h4 className="font-oswald text-2xl uppercase font-bold text-slate-900 mb-2">Coming Soon</h4>
                <p className="text-sm font-bold uppercase tracking-widest text-[#0066b2] bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                    <Clock size={14} /> Drop: {dropDateObj?.toLocaleDateString()}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-2">{dropDateObj?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
        )}

        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc("https://via.placeholder.com/400x500")}
          className={`w-full h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2 ${product.isSoldOut ? 'opacity-50 grayscale' : 'opacity-100'} ${isComingSoon ? 'blur-sm scale-90' : ''}`}
        />
      </div>

      <div className="p-8 flex flex-col flex-grow bg-white relative">
        <div className="flex justify-between items-start mb-4">
            <span className="text-[#0066b2] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                <Shirt size={12} /> {product.season}
            </span>
            
            {/* Size Selector - Hidden if Coming Soon */}
            {!isComingSoon && (
                <div className="flex gap-1">
                    {(['S', 'M', 'L', 'XL'] as Size[]).map((s) => {
                        const variant = product.variants?.find(v => v.size === s);
                        const isDisabled = !variant || variant.stock === 0;
                        return (
                            <button
                                key={s}
                                disabled={isDisabled}
                                onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
                                className={`w-6 h-6 text-[10px] font-bold rounded flex items-center justify-center transition-all ${selectedSize === s ? 'bg-black text-white scale-110 shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'} ${isDisabled ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                            >
                                {s}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
        
        <h3 className="text-black font-oswald text-2xl uppercase tracking-wide leading-tight mb-2 group-hover:text-[#0066b2] transition-colors">
          {isComingSoon ? '???' : product.title}
        </h3>
        
        <div className="min-h-[20px] mb-4">
             {!isComingSoon && (isSizeSoldOut ? (
                 <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1"><AlertCircle size={12} /> Taglia Esaurita</p>
             ) : (
                 <p className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Disponibilità: {stockCount} pezzi</p>
             ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Prezzo</span>
                 {isComingSoon ? (
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
                disabled={product.isSoldOut || isSizeSoldOut || isAdding || isAdded || isComingSoon}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 min-w-[120px] justify-center ${
                    product.isSoldOut || isSizeSoldOut || isComingSoon
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : isAdded ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-black text-white hover:bg-[#0066b2] hover:shadow-lg'
                }`}
            >
                {isComingSoon ? (
                    <><Lock size={14} /> Locked</>
                ) : product.isSoldOut || isSizeSoldOut ? (
                    'Esaurita'
                ) : isAdding ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : isAdded ? (
                    <><Check size={16} /> Aggiunto</>
                ) : (
                    <>Aggiungi <ShoppingBag size={14} /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
