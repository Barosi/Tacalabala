
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal, calculatePrice } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  // Sincronizza visibilità per gestire l'uscita dell'animazione
  useEffect(() => {
    if (isCartOpen) {
        setIsVisible(true);
        document.body.style.overflow = 'hidden'; // Blocca scroll pagina
    } else {
        const timer = setTimeout(() => setIsVisible(false), 500); // Aspetta fine animazione
        document.body.style.overflow = ''; // Sblocca scroll
        return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  // Se non è aperto e l'animazione è finita, nascondi completamente per performance
  if (!isCartOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-500 ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      
      {/* Overlay Oscuro (Fade In/Out) */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={toggleCart}
      />

      {/* Drawer Panel (Slide In/Out) */}
      <div 
        className={`
            relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col
            transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-blue-50 text-[#0066b2] rounded-xl"><ShoppingBag size={24} /></div>
             <div>
                <h2 className="text-xl font-oswald font-bold uppercase text-slate-900 leading-none">Il tuo Carrello</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">{cart.reduce((acc, i) => acc + i.quantity, 0)} articoli</p>
             </div>
          </div>
          <button onClick={toggleCart} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <ShoppingBag size={64} className="mb-6 opacity-20" strokeWidth={1} />
               <p className="uppercase tracking-widest font-bold text-sm">Carrello Vuoto</p>
               <button onClick={toggleCart} className="mt-6 text-[#0066b2] font-bold text-xs border-b border-[#0066b2] pb-0.5 hover:text-black hover:border-black transition-all">
                   Inizia lo shopping
               </button>
            </div>
          ) : (
            cart.map((item) => {
              const priceInfo = calculatePrice(item);
              return (
                <div key={item.cartId} className="flex gap-5 group animate-in fade-in slide-in-from-right-4 duration-500 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  
                  {/* Image: Fixed Size, Object Contain to avoid stretching */}
                  <div className="w-24 h-32 bg-white rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 relative p-2 flex items-center justify-center">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                  </div>

                  {/* Info Column - Vertical Layout */}
                  <div className="flex-1 flex flex-col relative">
                    
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-oswald font-bold text-slate-900 uppercase text-sm leading-tight line-clamp-2 pr-6" title={item.title}>
                            {item.title}
                        </h3>
                        <button 
                            onClick={() => removeFromCart(item.cartId)} 
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 absolute top-0 right-0"
                            title="Rimuovi"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Stacked Info */}
                    <div className="flex flex-col gap-1 mb-2">
                        {/* Edizione */}
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                            {item.season}
                        </span>
                        
                        {/* Taglia */}
                        <span className="text-xs font-bold uppercase text-slate-700">
                            Taglia: <span className="text-black">{item.selectedSize}</span>
                        </span>

                        {/* Prezzo (Sempre Nero) */}
                        <div className="mt-1">
                             {priceInfo.hasDiscount ? (
                                 <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 line-through font-medium leading-none mb-0.5">€{item.price}</span>
                                    <span className="font-oswald font-bold text-base text-black leading-none">€{priceInfo.finalPrice.toFixed(2)}</span>
                                 </div>
                            ) : (
                                 <span className="font-oswald font-bold text-base text-black leading-none">{item.price}</span>
                            )}
                        </div>
                    </div>

                    {/* Qty Control (Bottom Left aligned within column) */}
                    <div className="mt-auto">
                        <div className="flex items-center border border-slate-200 rounded-full h-7 px-1 shadow-sm w-max">
                            <button 
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-7 h-full flex items-center justify-center hover:text-[#0066b2] text-slate-400 transition-colors"
                            >
                            <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-[10px] font-bold text-slate-900">{item.quantity}</span>
                            <button 
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-7 h-full flex items-center justify-center hover:text-[#0066b2] text-slate-400 transition-colors"
                            >
                            <Plus size={12} />
                            </button>
                        </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Total */}
        {cart.length > 0 && (
          <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex-shrink-0 z-10">
            
            <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">Subtotale</span>
                    <span className="font-bold text-slate-900">€{cartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">Spedizione</span>
                    <span className="text-[#0066b2] font-bold text-xs uppercase">Calcolata al checkout</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-200 pt-4 mt-4">
                    <span className="font-oswald text-xl font-bold uppercase text-slate-900">Totale</span>
                    <span className="font-oswald text-2xl font-bold text-[#0066b2]">€{cartTotal().toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => { toggleCart(); onCheckout(); }}
                className="
                    relative w-1/2 overflow-hidden group/btn 
                    bg-white text-[#0066b2] border border-[#0066b2]
                    py-4 rounded-full font-bold uppercase tracking-widest text-xs
                    transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-900/20 
                    flex items-center justify-center gap-2 transform-gpu active:scale-95 mx-auto
                "
              >
                 <span className="absolute inset-0 bg-[#0066b2] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
                 <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-white transition-colors">
                    Checkout <ArrowRight size={16} />
                 </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
