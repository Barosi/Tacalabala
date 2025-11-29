
import React from 'react';
import { useStore } from '../store/useStore';
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal, calculatePrice } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="relative z-[100]">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={toggleCart}
      />

      {/* Drawer Panel - WIDER WIDTH (max-w-xl) */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-[#0066b2] rounded-xl"><ShoppingBag size={28} /></div>
             <div>
                <h2 className="text-2xl font-oswald font-bold uppercase text-slate-900">Il tuo Carrello</h2>
                <p className="text-sm text-slate-400">{cart.reduce((acc, i) => acc + i.quantity, 0)} articoli</p>
             </div>
          </div>
          <button onClick={toggleCart} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <X size={28} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <ShoppingBag size={80} className="mb-6 opacity-20" />
               <p className="uppercase tracking-widest font-bold text-lg">Carrello Vuoto</p>
               <button onClick={toggleCart} className="mt-6 text-[#0066b2] font-bold text-base border-b-2 border-[#0066b2] pb-1 hover:text-black hover:border-black transition-all">Torna allo shop</button>
            </div>
          ) : (
            cart.map((item) => {
              const priceInfo = calculatePrice(item);
              return (
                <div key={item.cartId} className="flex gap-6 group">
                  {/* Image - LARGER */}
                  <div className="w-28 h-36 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-oswald font-bold text-slate-900 uppercase text-lg leading-tight pr-4">{item.title}</h3>
                          <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                              <Trash2 size={20} />
                          </button>
                      </div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-3">{item.season}</p>
                      <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 uppercase">
                          Taglia: {item.selectedSize}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Qty Control - LARGER */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full h-10">
                        <button 
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600 rounded-l-full transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600 rounded-r-full transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* Price - LARGER */}
                      <div className="flex flex-col items-end">
                        {priceInfo.hasDiscount ? (
                             <>
                                <span className="text-sm text-slate-400 line-through mb-0.5">{item.price}</span>
                                <span className="font-oswald font-bold text-2xl text-red-600">€{priceInfo.finalPrice.toFixed(2)}</span>
                             </>
                        ) : (
                             <span className="font-oswald font-bold text-2xl text-slate-900">{item.price}</span>
                        )}
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
          <div className="p-8 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between mb-3 text-base">
              <span className="text-slate-500 font-medium">Subtotale</span>
              <span className="font-bold text-slate-800">€{cartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-8 text-base">
              <span className="text-slate-500 font-medium">Spedizione</span>
              <span className="text-[#0066b2] font-bold">Calcolata al checkout</span>
            </div>
            
            <div className="flex justify-between mb-8 text-3xl font-oswald font-bold border-t border-slate-200 pt-6 text-slate-900">
               <span>Totale</span>
               <span>€{cartTotal().toFixed(2)}</span>
            </div>

            <button 
              onClick={() => { toggleCart(); onCheckout(); }}
              className="w-full relative overflow-hidden group/btn bg-white border border-slate-900 text-slate-900 hover:text-white py-5 rounded-full font-bold uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-blue-900/20 flex items-center justify-center gap-3 text-base active:scale-95 transform-gpu"
            >
               <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
               <span className="relative z-10 flex items-center gap-2">
                  <CreditCard size={20} /> Procedi al Checkout
               </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
