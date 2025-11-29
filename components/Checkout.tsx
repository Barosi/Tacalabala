import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, CreditCard, CheckCircle, Loader2, FileText, Globe, Lock, AlertCircle } from 'lucide-react';
import { FaApplePay } from "react-icons/fa";

interface CheckoutProps {
  onBack: () => void;
}

const COUNTRIES = [
    { code: 'IT', name: 'Italia' },
    { code: 'DE', name: 'Germania' },
    { code: 'FR', name: 'Francia' },
    { code: 'ES', name: 'Spagna' },
    { code: 'UK', name: 'Regno Unito' },
    { code: 'CH', name: 'Svizzera' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgio' },
    { code: 'NL', name: 'Paesi Bassi' },
    { code: 'PT', name: 'Portogallo' },
    { code: 'OTHER', name: 'Altro (Resto del Mondo)' }
];

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, cartTotal, addOrder, shippingConfig } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [countryCode, setCountryCode] = useState('IT');
  const [wantInvoice, setWantInvoice] = useState(false);

  // --- STATI CARTA DI CREDITO ---
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [cardError, setCardError] = useState<{field: string, msg: string} | null>(null);

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', 
    address: '', city: '', zip: '', phone: '',
    taxId: '', vatNumber: '', sdiCode: '' 
  });

  const subTotal = cartTotal();
  const isItaly = countryCode === 'IT';
  
  let shippingCost = 0;
  if (isItaly) {
      shippingCost = subTotal >= shippingConfig.italyThreshold ? 0 : shippingConfig.italyPrice;
  } else {
      shippingCost = subTotal >= shippingConfig.foreignThreshold ? 0 : shippingConfig.foreignPrice;
  }
  
  const grandTotal = subTotal + shippingCost;

  // --- LOGICA FORMATTAZIONE CARTA ---
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardData({ ...cardData, number: val });
      if (cardError?.field === 'number') setCardError(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 4);
      if (val.length >= 3) {
          val = `${val.substring(0, 2)} / ${val.substring(2)}`;
      }
      setCardData({ ...cardData, expiry: val });
      if (cardError?.field === 'expiry') setCardError(null);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 4);
      setCardData({ ...cardData, cvc: val });
      if (cardError?.field === 'cvc') setCardError(null);
  };

  const validateCard = () => {
      const rawNumber = cardData.number.replace(/\s/g, '');
      if (rawNumber.length < 16) return { field: 'number', msg: 'Numero carta incompleto' };
      if (cardData.expiry.length < 5) return { field: 'expiry', msg: 'Data incompleta' };
      const month = parseInt(cardData.expiry.substring(0, 2));
      if (month < 1 || month > 12) return { field: 'expiry', msg: 'Mese non valido' };
      if (cardData.cvc.length < 3) return { field: 'cvc', msg: 'CVC incompleto' };
      return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCard();
    if (error) { setCardError(error); return; }

    setIsProcessing(true);
    
    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        customerEmail: form.email,
        customerName: `${form.firstName} ${form.lastName}`,
        total: grandTotal,
        shippingCost: shippingCost,
        items: [...cart],
        date: new Date().toISOString(),
        status: 'paid' as const,
        shippingAddress: `${form.address}, ${form.city} ${form.zip} (${COUNTRIES.find(c => c.code === countryCode)?.name})`,
        invoiceDetails: wantInvoice ? { taxId: form.taxId, vatNumber: form.vatNumber, sdiCode: form.sdiCode } : undefined
      };
      
      addOrder(newOrder);
      setIsProcessing(false);
      setIsSuccess(true);
      window.scrollTo(0,0);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100"><CheckCircle size={48} /></div>
        <h2 className="font-oswald text-4xl font-bold uppercase mb-4 text-slate-900">Ordine Confermato!</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">Grazie per il tuo acquisto. Abbiamo inviato una ricevuta a <span className="font-bold text-slate-900">{form.email}</span>.</p>
        <button onClick={onBack} className="bg-black text-white px-8 py-4 rounded-full uppercase font-bold tracking-widest hover:bg-[#0066b2] transition-all shadow-lg hover:shadow-blue-500/30">Torna alla Home</button>
      </div>
    );
  }

  if (cart.length === 0) {
      return (
          <div className="pt-64 pb-20 text-center min-h-screen flex flex-col items-center">
              <h2 className="font-oswald text-2xl uppercase font-bold text-slate-300 mb-4">Il carrello è vuoto.</h2>
              <button onClick={onBack} className="text-[#0066b2] font-bold uppercase tracking-wider text-xs border-b-2 border-[#0066b2] pb-1 hover:text-black hover:border-black transition-colors">Torna allo Shop</button>
          </div>
      )
  }

  const inputClass = "w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-[#0066b2] outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm";
  const labelClass = "block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider";

  return (
    <section className="pt-64 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl"> {/* max-w-7xl per dare spazio al layout a 2 colonne larghe */}
        
        <div className="text-center mb-16">
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                Zona <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">cesarini</span>
            </h2>
            <p className="text-slate-500">Completa il tuo ordine in pochi passaggi.</p>
        </div>

        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#0066b2] mb-8 text-[10px] font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Torna alla home
        </button>

        {/* LAYOUT A 2 COLONNE UGUALI (50% - 50%) */}
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* COLONNA SINISTRA: DATI SPEDIZIONE */}
          <div className="space-y-8">
             
             <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-200">
                 <h2 className="font-oswald text-2xl font-bold uppercase mb-8 flex items-center gap-3 text-slate-900">
                    <span className="w-8 h-8 bg-[#0066b2] text-white flex items-center justify-center rounded-full text-sm font-sans shadow-lg shadow-blue-500/30">1</span> 
                    Dati di Spedizione
                 </h2>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Email</label><input required type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tua@email.com" /></div>
                        <div><label className={labelClass}>Telefono</label><input required type="tel" className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+39 333..." /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Nome</label><input required type="text" className={inputClass} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                        <div><label className={labelClass}>Cognome</label><input required type="text" className={inputClass} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                    </div>
                    <div><label className={labelClass}>Indirizzo e N. Civico</label><input required type="text" className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Via Roma 10" /></div>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className={labelClass}>Città</label><input required type="text" className={inputClass} value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                        <div><label className={labelClass}>CAP</label><input required type="text" className={inputClass} value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} /></div>
                    </div>
                    <div>
                        <label className={`${labelClass} text-[#0066b2]`}>Paese / Nazione</label>
                        <div className="relative">
                            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${inputClass} appearance-none cursor-pointer font-bold text-slate-700`}>
                                {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                            </select>
                            <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                 </div>
             </div>

             <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-200">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="font-oswald text-2xl font-bold uppercase flex items-center gap-3 text-slate-900"><span className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-full text-sm font-sans">2</span> Dati Fatturazione</h2>
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => setWantInvoice(!wantInvoice)}>
                         <span className={`text-xs font-bold uppercase ${wantInvoice ? 'text-[#0066b2]' : 'text-slate-400'}`}>Richiedi Fattura</span>
                         <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${wantInvoice ? 'bg-[#0066b2]' : 'bg-slate-200'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${wantInvoice ? 'translate-x-6' : 'translate-x-0'}`} /></div>
                     </div>
                 </div>
                 <div className={`transition-all duration-500 overflow-hidden ${wantInvoice ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className={labelClass}>Codice Fiscale</label><input type="text" className={inputClass} value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} placeholder="CF..." /></div>
                             <div><label className={labelClass}>Partita IVA (Opzionale)</label><input type="text" className={inputClass} value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} placeholder="P.IVA..." /></div>
                             <div className="md:col-span-2"><label className={labelClass}>Codice SDI o PEC</label><input type="text" className={inputClass} value={form.sdiCode} onChange={e => setForm({...form, sdiCode: e.target.value})} placeholder="Codice Destinatario o PEC" /></div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* COLONNA DESTRA: RIEPILOGO AMPIO + PAGAMENTO */}
          <div className="space-y-8">
             <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-200 sticky top-32">
                <h3 className="font-oswald text-2xl font-bold uppercase mb-8 text-slate-900 border-b border-slate-100 pb-4">Il tuo Ordine</h3>
                
                {/* LISTA PRODOTTI */}
                <div className="space-y-6 mb-8">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex items-start gap-5">
                            <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                            </div>
                            <div className="flex-grow flex flex-col justify-center h-24">
                                <p className="font-bold text-base text-slate-900 uppercase leading-tight mb-2">{item.title}</p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1">
                                    Taglia: {item.selectedSize} <span className="mx-1">•</span> Qty: {item.quantity}
                                </p>
                                {/* PREZZO SOTTO LE INFO */}
                                <p className="font-oswald font-bold text-[#0066b2] text-lg">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* TOTALI */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-medium">Subtotale</span><span className="font-bold text-slate-800">€{subTotal.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-medium">Spedizione</span><span className={shippingCost === 0 ? "text-green-600 font-bold text-xs uppercase bg-green-50 px-3 py-1 rounded-full" : "font-bold text-slate-800"}>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span></div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-slate-900 mb-10">
                    <span className="font-oswald text-xl uppercase font-bold text-slate-900">Totale</span>
                    <span className="font-oswald text-3xl font-bold text-[#0066b2]">€{grandTotal.toFixed(2)}</span>
                </div>

                {/* --- SEZIONE PAGAMENTO --- */}
                <div className="space-y-6">
                    <label className={`${labelClass} mb-2 text-center w-full`}>Metodo di Pagamento</label>
                    
                    {/* APPLE PAY BUTTON (ALTEZZA h-16 = 64px) */}
                    <button type="button" className="w-full h-16 bg-black text-white rounded-full flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-opacity shadow-md">
                        <FaApplePay size={42} />
                    </button>

                    <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] uppercase font-bold">Oppure carta</span><div className="flex-grow border-t border-slate-200"></div></div>

                    {/* MODULO CARTA */}
                    <div className={`bg-white border rounded-2xl p-5 space-y-5 shadow-sm transition-all ${cardError ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-[#0066b2] focus-within:ring-1 focus-within:ring-[#0066b2]'}`}>
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <CreditCard size={22} className={cardError?.field === 'number' ? "text-red-500" : "text-slate-400"} />
                            <input 
                                type="text" 
                                placeholder="0000 0000 0000 0000" 
                                className="w-full outline-none text-lg bg-transparent placeholder:text-slate-300 text-slate-900 font-medium tracking-wide"
                                value={cardData.number}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                            />
                        </div>
                        <div className="flex gap-6">
                            <input 
                                type="text" 
                                placeholder="MM / AA" 
                                className={`w-1/2 outline-none text-lg bg-transparent placeholder:text-slate-300 text-slate-900 text-center font-medium ${cardError?.field === 'expiry' ? 'text-red-500' : ''}`}
                                value={cardData.expiry}
                                onChange={handleExpiryChange}
                                maxLength={7}
                            />
                            <div className="w-px bg-slate-200"></div>
                            <input 
                                type="text" 
                                placeholder="CVC" 
                                className={`w-1/2 outline-none text-lg bg-transparent placeholder:text-slate-300 text-slate-900 text-center font-medium ${cardError?.field === 'cvc' ? 'text-red-500' : ''}`}
                                value={cardData.cvc}
                                onChange={handleCvcChange}
                                maxLength={4}
                            />
                        </div>
                    </div>
                    
                    {/* Errore */}
                    {cardError && (
                        <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide animate-pulse">
                            <AlertCircle size={14} /> {cardError.msg}
                        </div>
                    )}
                </div>

                {/* BOTTONE FINALE (ALTEZZA h-16 = 64px, identica a Apple Pay) */}
                <button 
                    disabled={isProcessing} 
                    type="submit" 
                    className="w-full h-16 mt-8 bg-[#0066b2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm transform active:scale-95"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Paga Ora'}
                </button>
                
                <div className="mt-6 flex justify-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock size={10} /> Pagamento sicuro SSL
                    </p>
                </div>
             </div>
          </div>

        </form>
      </div>
    </section>
  );
};

export default Checkout;