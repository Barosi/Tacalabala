
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, CheckCircle, Loader2, Globe, Lock, AlertCircle, Truck, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { sendOrderConfirmationEmail } from '../utils/emailSender';

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

// --- STILE BOTTONI COERENTE ---
const btnPrimaryClass = "w-full relative overflow-hidden group/btn bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-blue-900/20 flex items-center justify-center gap-3 transform-gpu active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none";
const btnContentClass = "relative z-10 flex items-center gap-2";
const btnHoverBg = "absolute inset-0 bg-[#0066b2] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0";

// --- COMPONENTE INTERNO PER STRIPE ---
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
                return_url: window.location.origin,
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
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <PaymentElement options={{ layout: "tabs" }} />
            
            {msg && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle size={14}/> {msg}</div>}
            
            <button 
                disabled={!stripe || isProcessing} 
                type="submit" 
                className={btnPrimaryClass}
            >
                <span className={btnHoverBg}></span>
                <span className={btnContentClass}>
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CreditCard size={18} /> Paga Adesso</>}
                </span>
            </button>
            
            <div className="flex justify-center gap-2 items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider opacity-60">
                <ShieldCheck size={12} /> Transazione Sicura SSL 256-bit
            </div>
        </form>
    );
};

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, cartTotal, addOrder, shippingConfig, stripeConfig, clearCart, mailConfig, orders } = useStore();
  
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
    
    // STOP: Se sto già processando o ho già un OrderID, fermati.
    if (isProcessing || orderId) return;

    setServerError(null);

    // Validazione Fattura Custom
    if (wantInvoice) {
        if (!form.taxId && !form.vatNumber) {
            setServerError("Per la fattura è obbligatorio inserire almeno il Codice Fiscale o la Partita IVA.");
            return;
        }
    }

    if (!privacyAccepted || !termsAccepted) {
        alert("Devi accettare Privacy Policy e Termini per procedere.");
        return;
    }

    setIsProcessing(true);
    
    // Crea ordine "PENDING"
    const newOrderPayload = {
        customerEmail: form.email,
        customerName: `${form.firstName} ${form.lastName}`,
        shippingAddress: `${form.address}, ${form.city} ${form.zip} (${COUNTRIES.find(c => c.code === countryCode)?.name})`,
        items: cart.map(i => ({ id: i.id, selectedSize: i.selectedSize, quantity: i.quantity, title: i.title })), 
        invoiceDetails: wantInvoice ? { taxId: form.taxId, vatNumber: form.vatNumber, sdiCode: form.sdiCode } : undefined,
        total: grandTotal, 
        shippingCost: shippingCost,
        status: 'pending'
    };
    
    try {
        const createdOrder = await addOrder(newOrderPayload as any);
        if (!createdOrder) throw new Error("Errore nella creazione dell'ordine");
        
        setOrderId(createdOrder.id);

        const res = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: createdOrder.id })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        setClientSecret(data.clientSecret);
        setStep(2); // Unlock Payment
        setIsProcessing(false);

    } catch (err: any) {
        setIsProcessing(false);
        setOrderId(null); // Reset Order ID on error to allow retry
        console.error("Errore Checkout:", err);
        setServerError(err.message || "Impossibile procedere con l'ordine. Riprova.");
    }
  };

  const handleSuccess = async () => {
      // 1. Invio mail di conferma
      if (orderId) {
          // Trovo l'ordine appena creato nell'array locale (aggiornato da addOrder)
          const currentOrder = orders.find(o => o.id === orderId);
          if (currentOrder) {
              await sendOrderConfirmationEmail(mailConfig, currentOrder, form.email, `${form.firstName} ${form.lastName}`);
          }
      }

      setIsSuccess(true);
      window.scrollTo(0,0);
  };

  // --- UI SUCCESS ---
  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100"><CheckCircle size={48} /></div>
        <h2 className="font-oswald text-4xl font-bold uppercase mb-4 text-slate-900">Vittoria!</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">Il tuo ordine <strong>{orderId}</strong> è confermato. <br/>Ti abbiamo inviato una mail con i dettagli.</p>
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
          <div className="pt-64 pb-20 text-center min-h-screen flex flex-col items-center bg-slate-50">
              <h2 className="font-oswald text-2xl uppercase font-bold text-slate-300 mb-4">Spogliatoi Vuoti.</h2>
              <button onClick={onBack} className="text-[#0066b2] font-bold uppercase tracking-wider text-xs border-b-2 border-[#0066b2] pb-1 hover:text-black hover:border-black transition-colors">Torna allo Shop</button>
          </div>
      )
  }

  const inputClass = "w-full bg-white border border-slate-200 p-4 rounded-xl focus:border-[#0066b2] outline-none transition-colors text-slate-900 placeholder:text-slate-300 text-sm font-medium shadow-sm";
  const labelClass = "block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider pl-1";

  // Configurazione estetica Stripe Elements per matchare il sito
  const stripeAppearance = {
    theme: 'stripe' as const,
    variables: {
        colorPrimary: '#0066b2',
        colorBackground: '#ffffff',
        colorText: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '12px',
        colorDanger: '#ef4444',
    },
    rules: {
        '.Tab': {
            border: '1px solid #e2e8f0',
            boxShadow: 'none',
        },
        '.Tab:hover': {
            color: '#0f172a',
        },
        '.Tab--selected': {
            borderColor: '#0066b2',
            boxShadow: '0 0 0 1px #0066b2',
        },
        '.Input': {
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        '.Input:focus': {
            border: '1px solid #0066b2',
            boxShadow: '0 0 0 1px #0066b2',
        }
    }
  };

  return (
    <section className="pt-32 md:pt-48 pb-16 md:pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* HEADER ZONA CESARINI */}
        <div className="text-center mb-16">
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase mb-4 text-slate-900 leading-[1.1]">
                Zona <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Cesarini</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light">
                Ultimi minuti per chiudere la partita. Inserisci i dati e porta a casa il risultato.
            </p>
        </div>

        {serverError && (
            <div className="max-w-3xl mx-auto mb-10 bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
                <div className="p-3 bg-red-100 text-red-600 rounded-full"><AlertCircle size={24} /></div>
                <div>
                    <p className="font-bold uppercase text-xs tracking-wider mb-1">Attenzione</p>
                    <p className="text-sm font-medium">{serverError}</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* --- COLONNA SINISTRA (8 Cols) --- */}
          <div className="lg:col-span-7 space-y-8">
             
             {/* STEP 1: DATI SPEDIZIONE */}
             <div className={`bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border transition-all duration-500 ${step === 1 ? 'border-[#0066b2] ring-4 ring-blue-50' : 'border-slate-100 opacity-60 pointer-events-none grayscale'}`}>
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <h2 className="font-oswald text-2xl font-bold uppercase flex items-center gap-4 text-slate-900">
                        <span className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold shadow-md text-white transition-colors ${step > 1 ? 'bg-green-500' : 'bg-[#0066b2]'}`}>
                            {step > 1 ? <CheckCircle size={20}/> : '1'}
                        </span> 
                        Consegna
                    </h2>
                    {step === 2 && <button onClick={() => setStep(1)} className="text-xs font-bold uppercase text-slate-400 hover:text-[#0066b2] underline">Modifica</button>}
                 </div>
                 
                 {/* FORM STEP 1 */}
                 {step === 1 && (
                     <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-6 animate-in slide-in-from-left-2">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Email *</label><input required type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nome@email.com" /></div>
                            <div><label className={labelClass}>Telefono *</label><input required type="tel" className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+39 333 0000000" /></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Nome *</label><input required type="text" className={inputClass} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Mario" /></div>
                            <div><label className={labelClass}>Cognome *</label><input required type="text" className={inputClass} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Rossi" /></div>
                        </div>

                        <div><label className={labelClass}>Indirizzo e Numero Civico *</label><input required type="text" className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Via Alessandro Manzoni 10" /></div>

                        <div className="grid grid-cols-2 gap-6">
                            <div><label className={labelClass}>Città *</label><input required type="text" className={inputClass} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Milano" /></div>
                            <div><label className={labelClass}>CAP *</label><input required type="text" className={inputClass} value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} placeholder="20121" /></div>
                        </div>

                        <div>
                            <label className={`${labelClass} text-[#0066b2]`}>Paese di Spedizione *</label>
                            <div className="relative">
                                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${inputClass} appearance-none cursor-pointer font-bold text-slate-700 bg-slate-50`}>
                                    {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                                </select>
                                <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* SEZIONE FATTURA */}
                        <div className="pt-6 border-t border-slate-100">
                             <div className="flex items-center gap-3 cursor-pointer group mb-6" onClick={() => setWantInvoice(!wantInvoice)}>
                                 <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${wantInvoice ? 'bg-[#0066b2]' : 'bg-slate-200'}`}>
                                     <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${wantInvoice ? 'translate-x-6' : 'translate-x-0'}`} />
                                 </div>
                                 <div className="flex items-center gap-2 text-slate-700 font-bold uppercase text-xs tracking-wider">
                                     <FileText size={16} /> Richiedi Fattura
                                 </div>
                             </div>
                             
                             {wantInvoice && (
                                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in space-y-4">
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><AlertCircle size={12}/> Compila i dati fiscali</p>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                                            <label className={labelClass}>Codice Fiscale (Privati)</label>
                                            <input type="text" className={inputClass} value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} placeholder="RSSMRA80A01H501U" />
                                         </div>
                                         <div>
                                            <label className={labelClass}>Partita IVA (Aziende)</label>
                                            <input type="text" className={inputClass} value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} placeholder="IT12345678901" />
                                         </div>
                                     </div>
                                     <div>
                                        <label className={labelClass}>Codice SDI o PEC (Opzionale)</label>
                                        <input type="text" className={inputClass} value={form.sdiCode} onChange={e => setForm({...form, sdiCode: e.target.value})} placeholder="0000000 o nome@pec.it" />
                                     </div>
                                 </div>
                             )}
                        </div>

                        {/* LEGAL */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" required checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#0066b2] cursor-pointer" id="chk-privacy" />
                                <label htmlFor="chk-privacy" className="text-xs text-slate-500 cursor-pointer leading-tight">Ho letto e accetto la <span className="font-bold underline text-slate-700">Privacy Policy</span> *</label>
                            </div>
                            <div className="flex items-start gap-3">
                                <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#0066b2] cursor-pointer" id="chk-terms" />
                                <label htmlFor="chk-terms" className="text-xs text-slate-500 cursor-pointer leading-tight">Accetto i <span className="font-bold underline text-slate-700">Termini e Condizioni</span> di vendita *</label>
                            </div>
                        </div>

                        {/* BTN SUBMIT STEP 1 */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isProcessing || !privacyAccepted || !termsAccepted}
                                className={btnPrimaryClass}
                            >
                                <span className={btnHoverBg}></span>
                                <span className={btnContentClass}>
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Truck size={18} /> Vai al Pagamento</>}
                                </span>
                            </button>
                        </div>
                     </form>
                 )}
             </div>

             {/* STEP 2: PAGAMENTO */}
             <div className={`relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border transition-all duration-500 ${step === 2 ? 'border-[#0066b2] shadow-blue-900/10' : 'border-slate-100'}`}>
                 
                 {/* Overlay Bloccato */}
                 {step === 1 && (
                     <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2.5rem] border border-slate-200">
                         <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                             <Lock size={32} />
                         </div>
                         <p className="font-oswald uppercase font-bold text-slate-400 tracking-wider">Completa la spedizione per sbloccare</p>
                     </div>
                 )}

                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <h2 className={`font-oswald text-2xl font-bold uppercase flex items-center gap-4 ${step === 2 ? 'text-slate-900' : 'text-slate-300'}`}>
                        <span className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold shadow-md transition-colors ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>2</span> 
                        Pagamento
                    </h2>
                 </div>

                 {step === 2 && clientSecret && stripePromise && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                         
                         {/* PayPal */}
                         <div className="bg-[#fcfcfc] p-6 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">Opzioni Rapide</p>
                            <PayPalScriptProvider options={{ clientId: "test", currency: "EUR" }}>
                                <PayPalButtons 
                                    style={{ layout: "vertical", height: 48, shape: 'rect', color: 'gold', label: 'paypal' }} 
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
                                            clearCart();
                                            handleSuccess();
                                        }
                                    }}
                                />
                            </PayPalScriptProvider>
                         </div>
                         
                         <div className="relative flex py-2 items-center">
                             <div className="flex-grow border-t border-slate-200"></div>
                             <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] uppercase font-bold tracking-widest">Carta / Apple Pay / Google Pay</span>
                             <div className="flex-grow border-t border-slate-200"></div>
                         </div>

                         {/* Stripe */}
                         <div className="bg-white">
                             <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                                 <StripePaymentForm onSuccess={handleSuccess} />
                             </Elements>
                         </div>
                     </div>
                 )}
                 {step === 2 && !clientSecret && (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                         <Loader2 className="animate-spin mb-2 text-[#0066b2]" size={32} />
                         <p className="text-xs font-bold uppercase tracking-widest">Caricamento moduli sicuri...</p>
                     </div>
                 )}
             </div>

          </div>

          {/* --- COLONNA DESTRA (4 Cols) - RIEPILOGO STICKY --- */}
          <div className="lg:col-span-5 sticky top-32">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                    <CreditCard className="text-[#0066b2]" size={24} />
                    <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900">Riepilogo</h3>
                </div>
                
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex items-start gap-4 group">
                            <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 group-hover:border-[#0066b2] transition-colors">
                                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                            </div>
                            <div className="flex-grow pt-1">
                                <p className="font-bold text-sm text-slate-900 uppercase leading-tight mb-1 line-clamp-2">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                    {item.selectedSize} • Q.tà: {item.quantity}
                                </p>
                                <p className="font-oswald font-bold text-[#0066b2] text-sm mt-1">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-bold uppercase text-xs tracking-wide">Subtotale</span>
                         <span className="font-bold text-slate-800">€{subTotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-bold uppercase text-xs tracking-wide">Spedizione</span>
                         <span className={shippingCost === 0 ? "text-green-600 font-bold text-[10px] uppercase bg-green-50 px-2 py-0.5 rounded" : "font-bold text-slate-800"}>
                             {shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}
                         </span>
                     </div>
                </div>

                <div className="flex justify-between items-end mt-6 pt-6 border-t-2 border-slate-900">
                    <span className="font-oswald text-lg uppercase font-bold text-slate-900">Totale</span>
                    <div className="text-right">
                        <span className="font-oswald text-3xl font-bold text-[#0066b2] block leading-none">€{grandTotal.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">IVA Inclusa</span>
                    </div>
                </div>
             </div>
             
             {/* Security Badge */}
             <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 opacity-60">
                 <Lock size={12} /> <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout 256-bit SSL</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Checkout;
