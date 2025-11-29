
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

interface CheckoutProps {
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, cartTotal, addOrder, shippingConfig } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [country, setCountry] = useState<'IT' | 'FOREIGN'>('IT');

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', zip: '',
  });

  // Calculate Shipping
  const subTotal = cartTotal();
  let shippingCost = 0;
  if (country === 'IT') {
      shippingCost = subTotal >= shippingConfig.italyThreshold ? 0 : shippingConfig.italyPrice;
  } else {
      shippingCost = subTotal >= shippingConfig.foreignThreshold ? 0 : shippingConfig.foreignPrice;
  }
  const grandTotal = subTotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        customerEmail: form.email,
        total: grandTotal,
        shippingCost: shippingCost,
        items: [...cart],
        date: new Date().toISOString(),
        status: 'paid' as const,
        shippingAddress: `${form.address}, ${form.city} ${form.zip} (${country})`
      };
      addOrder(newOrder);
      setIsProcessing(false);
      setIsSuccess(true);
      window.scrollTo(0,0);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce"><CheckCircle size={48} /></div>
        <h2 className="font-oswald text-4xl font-bold uppercase mb-4">Ordine Confermato!</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">Grazie per il tuo acquisto. Abbiamo inviato una ricevuta a <span className="font-bold text-black">{form.email}</span>.</p>
        <button onClick={onBack} className="bg-black text-white px-8 py-3 rounded-full uppercase font-bold tracking-widest hover:bg-[#0066b2] transition-colors">Torna alla Home</button>
      </div>
    );
  }

  if (cart.length === 0) {
      return (
          <div className="pt-40 pb-20 text-center">
              <h2 className="font-oswald text-2xl">Il carrello è vuoto.</h2>
              <button onClick={onBack} className="mt-4 text-[#0066b2] underline">Torna indietro</button>
          </div>
      )
  }

  return (
    <section className="pt-64 pb-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-black mb-8 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16} /> Torna indietro</button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
             <h2 className="font-oswald text-3xl font-bold uppercase mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-[#0066b2] text-white flex items-center justify-center rounded-full text-sm">1</span> Dati di Spedizione</h2>
             <form id="checkout-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <label className="block text-[10px] uppercase font-bold text-[#0066b2] mb-2">Destinazione</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={country === 'IT'} onChange={() => setCountry('IT')} className="text-[#0066b2]" />
                            <span className="text-sm font-bold">Italia 🇮🇹</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={country === 'FOREIGN'} onChange={() => setCountry('FOREIGN')} className="text-[#0066b2]" />
                            <span className="text-sm font-bold">Estero 🌍</span>
                        </label>
                    </div>
                </div>
                {/* Form fields same as before... */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email</label><input required type="email" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nome</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cognome</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                    <div className="col-span-2"><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Indirizzo</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Città</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">CAP</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg focus:border-[#0066b2] outline-none" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} /></div>
                </div>
                {/* Payment UI... */}
             </form>
          </div>
          <div>
             <h2 className="font-oswald text-3xl font-bold uppercase mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-full text-sm">2</span> Riepilogo</h2>
             <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 sticky top-32">
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-16 bg-slate-50 rounded border border-slate-100 overflow-hidden"><img src={item.imageUrl} className="w-full h-full object-cover" /></div>
                                <div><p className="font-bold text-sm uppercase">{item.title}</p><p className="text-xs text-slate-500">{item.selectedSize} x {item.quantity}</p></div>
                            </div>
                            <span className="font-oswald font-bold">{item.price}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 text-sm border-t border-slate-100 pt-4 mb-6">
                     <div className="flex justify-between"><span className="text-slate-500">Subtotale</span><span>€{subTotal.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center">
                         <span className="text-slate-500">Spedizione ({country === 'IT' ? 'Italia' : 'Estero'})</span>
                         <span className={shippingCost === 0 ? "text-green-600 font-bold" : "font-bold"}>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span>
                     </div>
                </div>
                <div className="flex justify-between items-center mb-8 pt-4 border-t-2 border-black">
                    <span className="font-oswald text-xl uppercase font-bold">Totale</span>
                    <span className="font-oswald text-2xl font-bold text-[#0066b2]">€{grandTotal.toFixed(2)}</span>
                </div>
                <button form="checkout-form" disabled={isProcessing} type="submit" className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#0066b2] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Paga Ora'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Checkout;
