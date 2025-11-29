
import React from 'react';
import { useStore } from '../store/useStore';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

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

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
             <ShoppingBag className="text-[#0066b2]" />
             <h2 className="text-xl font-oswald font-bold uppercase text-slate-900">Il tuo Carrello</h2>
          </div>
          <button onClick={toggleCart} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <ShoppingBag size={64} className="mb-4 opacity-20" />
               <p className="uppercase tracking-widest font-bold text-sm">Carrello Vuoto</p>
               <button onClick={toggleCart} className="mt-4 text-[#0066b2] text-sm underline">Torna allo shop</button>
            </div>
          ) : (
            cart.map((item) => {
              const priceInfo = calculatePrice(item);
              return (
                <div key={item.cartId} className="flex gap-4 group">
                  {/* Image */}
                  <div className="w-20 h-28 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                          <h3 className="font-oswald font-bold text-slate-900 uppercase text-sm leading-tight pr-2">{item.title}</h3>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">{item.season}</p>
                      <div className="inline-block mt-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                          Taglia: {item.selectedSize}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty Control */}
                      <div className="flex items-center border border-slate-200 rounded-full h-8">
                        <button 
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded-l-full"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded-r-full"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex flex-col items-end">
                        {priceInfo.hasDiscount ? (
                             <>
                                <span className="text-xs text-slate-400 line-through">{item.price}</span>
                                <span className="font-oswald font-bold text-lg text-red-600">€{priceInfo.finalPrice.toFixed(2)}</span>
                             </>
                        ) : (
                             <span className="font-oswald font-bold text-lg">{item.price}</span>
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
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-500">Subtotale</span>
              <span className="font-bold">€{cartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-sm">
              <span className="text-slate-500">Spedizione</span>
              <span className="text-[#0066b2] font-bold">Calcolata al checkout</span>
            </div>
            
            <div className="flex justify-between mb-6 text-2xl font-oswald font-bold border-t border-slate-200 pt-4">
               <span>Totale</span>
               <span>€{cartTotal().toFixed(2)}</span>
            </div>

            <button 
              onClick={() => { toggleCart(); onCheckout(); }}
              className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#0066b2] transition-all shadow-lg hover:shadow-blue-900/20"
            >
              Procedi al Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
