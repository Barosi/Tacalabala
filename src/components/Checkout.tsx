
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, CreditCard, CheckCircle, Loader2, Globe, Lock, AlertCircle, Info, Truck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface CheckoutProps {
  onBack: () => void;
  onNavigate?: (page: 'privacy' | 'terms') => void;
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

// --- COMPONENTE INTERNO PER STRIPE (NECESSARIO PER HOOKS) ---
const StripePaymentForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [msg, setMsg] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { clearCart } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMsg(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin, // Non usiamo redirect qui, gestiamo inline se possibile
            },
            redirect: 'if_required' 
        });

        if (error) {
            setMsg(error.message || "Pagamento fallito");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            clearCart();
            onSuccess();
        } else {
             setMsg("Stato del pagamento imprevisto.");
             setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {msg && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">{msg}</div>}
            <button 
                disabled={!stripe || isProcessing} 
                type="submit" 
                className="w-full h-14 bg-[#0066b2] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#005599] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Paga Ora'}
            </button>
            <div className="flex justify-center gap-2 items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Lock size={10} /> Transazione Sicura Stripe
            </div>
        </form>
    );
};

const Checkout: React.FC<CheckoutProps> = ({ onBack, onNavigate }) => {
  const { cart, cartTotal, addOrder, shippingConfig, stripeConfig, clearCart } = useStore();
  
  // Steps: 1 = Address, 2 = Payment
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const [countryCode, setCountryCode] = useState('IT');
  const [wantInvoice, setWantInvoice] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', 
    address: '', city: '', zip: '', phone: '',
    taxId: '', vatNumber: '', sdiCode: '' 
  });

  // Init Stripe
  useEffect(() => {
    if (stripeConfig.publicKey) {
        setStripePromise(loadStripe(stripeConfig.publicKey));
    }
  }, [stripeConfig]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const subTotal = cartTotal();
  const isItaly = countryCode === 'IT';
  
  let shippingCost = 0;
  if (isItaly) {
      shippingCost = subTotal >= shippingConfig.italyThreshold ? 0 : shippingConfig.italyPrice;
  } else {
      shippingCost = subTotal >= shippingConfig.foreignThreshold ? 0 : shippingConfig.foreignPrice;
  }
  const grandTotal = subTotal + shippingCost;

  // --- STEP 1: CREAZIONE ORDINE PENDING ---
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!privacyAccepted || !termsAccepted) {
        alert("Devi accettare Privacy Policy e Termini per procedere.");
        return;
    }

    setIsProcessing(true);
    
    // 1. Crea ordine "PENDING"
    const newOrderPayload = {
        customerEmail: form.email,
        customerName: `${form.firstName} ${form.lastName}`,
        shippingAddress: `${form.address}, ${form.city} ${form.zip} (${COUNTRIES.find(c => c.code === countryCode)?.name})`,
        items: cart.map(i => ({ id: i.id, selectedSize: i.selectedSize, quantity: i.quantity, title: i.title })), 
        invoiceDetails: wantInvoice ? { taxId: form.taxId, vatNumber: form.vatNumber, sdiCode: form.sdiCode } : undefined,
        total: grandTotal, 
        shippingCost: shippingCost,
        status: 'pending' // Importante
    };
    
    try {
        const createdOrder = await addOrder(newOrderPayload as any);
        if (!createdOrder) throw new Error("Errore creazione ordine");
        
        setOrderId(createdOrder.id);

        // 2. Chiedi PaymentIntent a Stripe
        const res = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: createdOrder.id })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        setClientSecret(data.clientSecret);
        setStep(2); // Passa al pagamento
        setIsProcessing(false);

    } catch (err: any) {
        setIsProcessing(false);
        console.error("Errore Checkout:", err);
        setServerError(err.message || "Errore nel processare l'ordine.");
    }
  };

  const handleSuccess = () => {
      setIsSuccess(true);
      window.scrollTo(0,0);
  };

  // UI SUCCESS
  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100"><CheckCircle size={48} /></div>
        <h2 className="font-oswald text-4xl font-bold uppercase mb-4 text-slate-900">Ordine Confermato!</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">Grazie per il tuo acquisto. L'ordine <strong>{orderId}</strong> è stato pagato con successo. Riceverai una mail di conferma a breve.</p>
        <button onClick={onBack} className="relative overflow-hidden group/btn bg-white border border-slate-900 text-slate-900 hover:text-white px-10 py-4 rounded-full uppercase font-bold tracking-widest transition-all duration-300 shadow-lg hover:shadow-blue-500/30 active:scale-95 transform-gpu flex items-center gap-2 min-w-[240px] justify-center">
            <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
            <span className="relative z-10 flex items-center gap-2">
                <ArrowLeft size={16} /> Torna alla Home
            </span>
        </button>
      </div>
    );
  }

  if (cart.length === 0 && !orderId) {
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
    <section className="pt-32 md:pt-48 pb-16 md:pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* HEADER */}
        <div className="text-center mb-10">
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                Checkout <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Sicuro</span>
            </h2>
            {step === 2 && <p className="text-slate-500">Ordine creato. Completa il pagamento.</p>}
        </div>

        {serverError && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle size={24} className="flex-shrink-0" />
                <div>
                    <p className="font-bold uppercase text-xs tracking-wider">Errore</p>
                    <p className="text-sm">{serverError}</p>
                </div>
            </div>
        )}

        {/* LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* COLONNA SINISTRA: FORMS */}
          <div className="space-y-8">
             
             {/* STEP 1: INDIRIZZO */}
             <div className={`bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border transition-all duration-500 ${step === 1 ? 'border-[#0066b2] shadow-lg' : 'border-slate-200 opacity-60 pointer-events-none'}`}>
                 <h2 className="font-oswald text-2xl font-bold uppercase mb-8 flex items-center gap-3 text-slate-900">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-sans flex-shrink-0 text-white ${step > 1 ? 'bg-green-500' : 'bg-[#0066b2]'}`}>
                        {step > 1 ? <CheckCircle size={16}/> : '1'}
                    </span> 
                    Dati di Spedizione
                 </h2>
                 
                 {/* Mostra form solo se step 1 */}
                 {step === 1 && (
                     <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-6 animate-in slide-in-from-left-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Email</label><input required type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="mario.rossi@email.com" /></div>
                            <div><label className={labelClass}>Telefono</label><input required type="tel" className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+39 333 1234567" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Nome</label><input required type="text" className={inputClass} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Mario" /></div>
                            <div><label className={labelClass}>Cognome</label><input required type="text" className={inputClass} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Rossi" /></div>
                        </div>
                        <div><label className={labelClass}>Indirizzo</label><input required type="text" className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Via Alessandro Manzoni 10" /></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className={labelClass}>Città</label><input required type="text" className={inputClass} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Milano" /></div>
                            <div><label className={labelClass}>CAP</label><input required type="text" className={inputClass} value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} placeholder="20121" /></div>
                        </div>
                        <div>
                            <label className={`${labelClass} text-[#0066b2]`}>Paese</label>
                            <div className="relative">
                                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${inputClass} appearance-none cursor-pointer font-bold text-slate-700`}>
                                    {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                                </select>
                                <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* FATTURA */}
                        <div className="pt-4 border-t border-slate-100">
                             <div className="flex items-center gap-3 cursor-pointer group mb-4" onClick={() => setWantInvoice(!wantInvoice)}>
                                 <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${wantInvoice ? 'bg-[#0066b2]' : 'bg-slate-200'}`}>
                                     <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${wantInvoice ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </div>
                                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Richiedi Fattura</span>
                             </div>
                             {wantInvoice && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in">
                                     <div><label className={labelClass}>Codice Fiscale</label><input type="text" className={inputClass} value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} /></div>
                                     <div><label className={labelClass}>P.IVA</label><input type="text" className={inputClass} value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} /></div>
                                     <div className="md:col-span-2"><label className={labelClass}>SDI / PEC</label><input type="text" className={inputClass} value={form.sdiCode} onChange={e => setForm({...form, sdiCode: e.target.value})} /></div>
                                 </div>
                             )}
                        </div>

                        {/* LEGAL */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" required checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="w-4 h-4 text-[#0066b2] rounded" id="chk-privacy" />
                                <label htmlFor="chk-privacy" className="text-xs text-slate-500">Ho letto la <span className="underline cursor-pointer font-bold">Privacy Policy</span>.</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="w-4 h-4 text-[#0066b2] rounded" id="chk-terms" />
                                <label htmlFor="chk-terms" className="text-xs text-slate-500">Accetto i <span className="underline cursor-pointer font-bold">Termini e Condizioni</span>.</label>
                            </div>
                        </div>

                        {/* BTN SUBMIT STEP 1 */}
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isProcessing || !privacyAccepted || !termsAccepted}
                                className="w-full h-14 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#0066b2] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <><Truck size={18} /> Vai al Pagamento</>}
                            </button>
                        </div>
                     </form>
                 )}
             </div>

             {/* STEP 2: PAGAMENTO (Stripe Elements) */}
             <div className={`bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border transition-all duration-500 ${step === 2 ? 'border-[#0066b2] shadow-2xl ring-2 ring-blue-50' : 'border-slate-200 opacity-50'}`}>
                 <h2 className="font-oswald text-2xl font-bold uppercase mb-8 flex items-center gap-3 text-slate-900">
                    <span className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-full text-sm font-sans flex-shrink-0">2</span> 
                    Pagamento Sicuro
                 </h2>

                 {step === 2 && clientSecret && stripePromise && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                         
                         {/* PayPal Standalone Button */}
                         <div>
                            <p className={labelClass}>Paga con PayPal</p>
                            <PayPalScriptProvider options={{ clientId: "test", currency: "EUR" }}>
                                <PayPalButtons 
                                    style={{ layout: "horizontal", height: 48, tagline: false }} 
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            intent: "CAPTURE",
                                            purchase_units: [{ 
                                                amount: { currency_code: "EUR", value: grandTotal.toFixed(2) },
                                                description: `Ordine ${orderId}`
                                            }]
                                        });
                                    }}
                                    onApprove={async (data, actions) => {
                                        if (actions.order) {
                                            await actions.order.capture();
                                            // Handle server update manually for PayPal if needed or rely on PayPal webhooks
                                            clearCart();
                                            handleSuccess();
                                        }
                                    }}
                                />
                            </PayPalScriptProvider>
                         </div>
                         
                         <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] uppercase font-bold">Oppure Carta / Apple Pay</span><div className="flex-grow border-t border-slate-200"></div></div>

                         {/* Stripe Elements */}
                         <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                             <StripePaymentForm onSuccess={handleSuccess} />
                         </Elements>
                     </div>
                 )}
                 {step === 2 && !clientSecret && (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                         <Loader2 className="animate-spin mb-2" size={32} />
                         <p className="text-xs font-bold uppercase">Inizializzazione pagamento...</p>
                     </div>
                 )}
             </div>

          </div>

          {/* COLONNA DESTRA: RIEPILOGO */}
          <div className="sticky top-32">
             <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-200">
                <h3 className="font-oswald text-2xl font-bold uppercase mb-8 text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-3">
                    Riepilogo Ordine
                </h3>
                
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex items-start gap-5">
                            <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-sm text-slate-900 uppercase leading-tight mb-1">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                    {item.selectedSize} • x{item.quantity}
                                </p>
                                <p className="font-oswald font-bold text-[#0066b2] text-base mt-1">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-medium">Subtotale</span><span className="font-bold text-slate-800">€{subTotal.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center text-sm"><span className="text-slate-500 font-medium">Spedizione</span><span className={shippingCost === 0 ? "text-green-600 font-bold text-xs uppercase bg-green-50 px-3 py-1 rounded-full" : "font-bold text-slate-800"}>{shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}</span></div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-slate-900">
                    <span className="font-oswald text-xl uppercase font-bold text-slate-900">Totale</span>
                    <span className="font-oswald text-3xl font-bold text-[#0066b2]">€{grandTotal.toFixed(2)}</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Checkout;
