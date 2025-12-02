
import React, { useState, useEffect } from 'react';
import { Product, Size } from '../types';
import { useStore } from '../store/useStore';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Ruler, Check, Heart, Share2, Tag, X, Headphones, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onCheckout: () => void;
}

const SizeGuideModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 border border-slate-100 overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900">Guida alle Taglie</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
                    </div>
                    <div className="p-8">
                        <p className="text-sm text-slate-500 mb-6 font-medium">Le nostre t-shirt hanno una vestibilità <span className="text-[#0066b2] font-bold">Oversize Boxy</span>. Ti consigliamo di prendere la tua taglia abituale per un fit rilassato.</p>
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-4 text-center">Taglia</th>
                                        <th className="px-4 py-4 text-center">Larghezza</th>
                                        <th className="px-4 py-4 text-center">Lunghezza</th>
                                        <th className="px-4 py-4 text-center">Altezza Consigliata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-center">
                                    <tr><td className="px-4 py-4 font-bold text-[#0066b2]">S</td><td className="px-4 py-4">54 cm</td><td className="px-4 py-4">70 cm</td><td className="px-4 py-4 font-bold text-slate-500">165 - 170 cm</td></tr>
                                    <tr><td className="px-4 py-4 font-bold text-[#0066b2]">M</td><td className="px-4 py-4">57 cm</td><td className="px-4 py-4">72 cm</td><td className="px-4 py-4 font-bold text-slate-500">170 - 178 cm</td></tr>
                                    <tr><td className="px-4 py-4 font-bold text-[#0066b2]">L</td><td className="px-4 py-4">60 cm</td><td className="px-4 py-4">74 cm</td><td className="px-4 py-4 font-bold text-slate-500">178 - 185 cm</td></tr>
                                    <tr><td className="px-4 py-4 font-bold text-[#0066b2]">XL</td><td className="px-4 py-4">63 cm</td><td className="px-4 py-4">76 cm</td><td className="px-4 py-4 font-bold text-slate-500">185 - 195 cm</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <Ruler size={14} /> Misure in cm (Tolleranza +/- 1cm)
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onCheckout }) => {
  const { addToCart, calculatePrice } = useStore();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mainImage, setMainImage] = useState(product.imageUrl);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
    } else {
        setMainImage(product.imageUrl);
    }
    window.scrollTo(0, 0);

    // Auto-select first available size
    if (product.variants) {
        const firstAvailable = product.variants.find(v => v.stock > 0);
        if (firstAvailable) {
            setSelectedSize(firstAvailable.size as Size);
        }
    }
  }, [product]);

  const priceInfo = calculatePrice(product);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setIsAdding(true);
    addToCart(product, selectedSize);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 2000);
      });
  };

  const currentVariant = product.variants?.find(v => v.size === selectedSize);
  const stockCount = currentVariant ? currentVariant.stock : 0;
  const isSoldOut = product.isSoldOut || (selectedSize && stockCount === 0);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <section className="pt-32 md:pt-48 pb-24 bg-white min-h-screen relative animate-in fade-in duration-500">
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      
      {/* Toast Share */}
      <AnimatePresence>
        {showShareToast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl z-50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Check size={14} /> Link Copiato
            </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="mb-8 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0066b2] font-bold uppercase text-[10px] tracking-widest transition-colors">
                <ArrowLeft size={14} /> Torna allo Store
            </button>
            <div className="flex gap-4">
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 hover:text-slate-900'}`}><Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} /></button>
                <button onClick={handleShare} className="text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={20} /></button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* LEFT COLUMN: IMAGES */}
            <div className="space-y-4">
                <div className="relative bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm aspect-[4/5] lg:aspect-square group">
                    <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-8 md:p-16 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1" />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        {product.isSoldOut && <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Sold Out</span>}
                        {priceInfo.hasDiscount && <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Sale -{priceInfo.discountPercent}%</span>}
                    </div>
                </div>

                {gallery.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                        {gallery.map((img, idx) => (
                            <div key={idx} onClick={() => setMainImage(img)} className={`bg-slate-50 rounded-2xl border aspect-square p-2 cursor-pointer transition-colors ${mainImage === img ? 'border-[#0066b2] ring-2 ring-blue-50' : 'border-slate-200 hover:border-[#0066b2] opacity-70 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-contain" alt="" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: INFO */}
            <div className="flex flex-col h-full py-4">
                <div className="mb-8">
                    <div className="flex justify-center md:justify-start mb-6">
                        <span className="inline-block px-4 py-1 border border-slate-200 rounded-full text-[#0066b2] font-bold uppercase tracking-[0.2em] text-[10px]">{product.season}</span>
                    </div>
                    <h1 className="font-oswald text-3xl md:text-5xl font-bold uppercase text-slate-900 leading-tight mb-4 break-words w-full" title={product.title}>{product.title}</h1>
                    <div className="flex items-center gap-4 mb-6">
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Tag size={14} className="text-[#0066b2]" /> SKU: {product.articleCode}</p>
                    </div>
                    <div className="flex flex-col gap-1">
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
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IVA Inclusa</span>
                    </div>
                </div>

                {/* Size Selector */}
                <div className="mb-8 w-full">
                    <div className="flex justify-between items-center mb-4 w-full md:w-1/2">
                        <span className="text-xs font-bold uppercase text-slate-900 tracking-wide">Seleziona Taglia</span>
                        <button onClick={() => setShowSizeGuide(true)} className="text-[10px] font-bold uppercase text-[#0066b2] flex items-center gap-1 hover:underline"><Ruler size={12} /> Guida Taglie</button>
                    </div>
                    
                    {/* Size Selector with Animated Pill (BLUE) - HALF WIDTH on Desktop */}
                    <div className="w-full md:w-1/2">
                        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 w-full relative">
                            {['S', 'M', 'L', 'XL'].map((s) => {
                                const variant = product.variants?.find(v => v.size === s);
                                const disabled = !variant || variant.stock === 0;
                                const isSelected = selectedSize === s;

                                return (
                                    <button 
                                        key={s} 
                                        disabled={disabled} 
                                        onClick={() => setSelectedSize(s as Size)} 
                                        className={`
                                            relative flex-1 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10
                                            ${disabled ? 'opacity-30 cursor-not-allowed line-through text-slate-400' : isSelected ? 'text-white' : 'text-slate-600 hover:text-black'}
                                        `}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="size-select-pill-details"
                                                className="absolute inset-0 bg-[#0066b2] rounded-full -z-10 shadow-sm"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {s}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    
                    {selectedSize && !isSoldOut && <p className="mt-3 text-[10px] font-bold uppercase text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Disponibilità Immediata</p>}
                </div>

                {/* ADD TO CART BUTTON - LIQUID FILL BLUE - HALF WIDTH */}
                <div className="mb-10 border-b border-slate-100 pb-10 w-full">
                    <div className="w-full md:w-1/2">
                        <button 
                            onClick={handleAddToCart} 
                            disabled={!selectedSize || isSoldOut} 
                            className={`
                                relative w-full overflow-hidden group/btn 
                                px-10 py-5 rounded-full 
                                font-bold uppercase tracking-widest text-xs 
                                flex items-center justify-center gap-3 
                                transition-all duration-300 transform-gpu active:scale-[0.98] border
                                ${isAdding 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : (!selectedSize || isSoldOut) 
                                        ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white border-[#0066b2] text-[#0066b2] hover:text-white shadow-lg hover:shadow-xl hover:shadow-blue-900/10'
                                }
                            `}
                        >
                            {/* LIQUID FILL EFFECT */}
                            {(!isAdding && selectedSize && !isSoldOut) && (
                                <span className="absolute inset-0 bg-[#0066b2] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                            )}
                            
                            <span className="relative z-10 flex items-center gap-2">
                                {isAdding ? <Check size={18} /> : <ShoppingBag size={18} />}
                                {isAdding ? 'Aggiunto' : isSoldOut ? 'Esaurito' : 'Aggiungi al carrello'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-oswald text-xl uppercase font-bold text-slate-900">Dettagli Prodotto</h3>
                    <p className="text-slate-600 leading-relaxed font-light text-base">{product.description}</p>
                    
                    {/* WIDGETS SECTION (SQUARED & ELEGANT) */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        {/* Widget 1 */}
                        <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center group hover:border-[#0066b2] transition-colors">
                            <Truck className="text-[#0066b2] mb-2 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                            <span className="text-[9px] font-bold uppercase text-slate-600 leading-tight">Spedizione<br/>Express</span>
                        </div>
                        {/* Widget 2 */}
                        <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center group hover:border-[#0066b2] transition-colors">
                            <ShieldCheck className="text-[#0066b2] mb-2 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                            <span className="text-[9px] font-bold uppercase text-slate-600 leading-tight">100%<br/>Autentico</span>
                        </div>
                        {/* Widget 3 */}
                        <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center group hover:border-[#0066b2] transition-colors">
                            <Headphones className="text-[#0066b2] mb-2 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                            <span className="text-[9px] font-bold uppercase text-slate-600 leading-tight">Supporto<br/>H24</span>
                        </div>
                        {/* Widget 4 */}
                        <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-2 text-center group hover:border-[#0066b2] transition-colors">
                            <Lock className="text-[#0066b2] mb-2 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
                            <span className="text-[9px] font-bold uppercase text-slate-600 leading-tight">Pagamenti<br/>Sicuri</span>
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
