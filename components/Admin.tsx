import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Size, FAQ, Discount, OrderStatus, ShippingConfig } from '../types';
import { Plus, Trash2, LogOut, Package, CreditCard, Save, MessageCircle, HelpCircle, Tag, Calendar, ShoppingBag, Truck, CheckCircle, XCircle, AlertCircle, Clock, Mail, Plane, AlertTriangle, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

// --- COMPONENTE MODALE CONFERMA ---
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center border border-slate-100 transform transition-all scale-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm">
            <AlertTriangle size={32} />
        </div>
        <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">{message}</p>
        <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold uppercase text-xs rounded-xl hover:bg-slate-200 transition-colors">
                Annulla
            </button>
            <button onClick={onConfirm} className="flex-1 py-4 bg-red-600 text-white font-bold uppercase text-xs rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors">
                Conferma
            </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE TOAST NOTIFICATION ---
const Toast = ({ message, show }: { message: string, show: boolean }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-slate-900">
                <Check size={18} strokeWidth={3} />
            </div>
            <div>
                <p className="font-bold text-sm uppercase tracking-wide">Successo</p>
                <p className="text-xs text-slate-400">{message}</p>
            </div>
        </div>
    );
};

interface AdminProps {
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const { 
    products, orders, discounts,
    stripeConfig, supportConfig, mailConfig, shippingConfig,
    addProduct, deleteProduct, addDiscount, deleteDiscount,
    addFaq, deleteFaq, setStripeConfig, setSupportConfig, setMailConfig, setShippingConfig,
    updateOrderStatus, deleteOrder, calculatePrice,
  } = useStore();

  // Aggiunto 'faq' ai tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'shipping' | 'payments' | 'support' | 'faq' | 'promotions'>('products');
  
  // State per la notifica Toast
  const [toast, setToast] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  const showToast = (msg: string) => {
      setToast({ show: true, msg });
      setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // --- MODAL STATE ---
  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const confirmAction = (title: string, message: string, action: () => void) => {
      setModalConfig({
          isOpen: true, title, message,
          onConfirm: () => { action(); setModalConfig(prev => ({ ...prev, isOpen: false })); }
      });
  };

  // --- STATES ---
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '', season: '', price: '€', imageUrl: '', condition: 'Nuova', description: '', isSoldOut: false, tags: [], instagramUrl: '', dropDate: ''
  });

  const [variantsState, setVariantsState] = useState<{size: Size, enabled: boolean, stock: string}[]>([
    { size: 'S', enabled: true, stock: '10' },
    { size: 'M', enabled: true, stock: '10' },
    { size: 'L', enabled: true, stock: '10' },
    { size: 'XL', enabled: true, stock: '10' },
  ]);

  const [paymentForm, setPaymentForm] = useState(stripeConfig);
  const [shippingForm, setShippingForm] = useState<ShippingConfig>(shippingConfig || { italyPrice: 0, italyThreshold: 0, foreignPrice: 0, foreignThreshold: 0 });
  const [whatsappNum, setWhatsappNum] = useState(supportConfig.whatsappNumber);
  const [mailForm, setMailForm] = useState(mailConfig);

  // --- SYNC EFFECTS ---
  useEffect(() => { if (stripeConfig) setPaymentForm(stripeConfig); }, [stripeConfig]);
  useEffect(() => { if (shippingConfig) setShippingForm(shippingConfig); }, [shippingConfig]);
  useEffect(() => { if (supportConfig.whatsappNumber) setWhatsappNum(supportConfig.whatsappNumber); }, [supportConfig.whatsappNumber]);
  useEffect(() => { if (mailConfig) setMailForm(mailConfig); }, [mailConfig]);

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [discountDates, setDiscountDates] = useState({ start: today, end: nextWeek });

  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
      name: '', percentage: 20, targetType: 'all', targetProductIds: [], isActive: true
  });

  // --- HANDLERS ---
  const handleVariantChange = (index: number, field: 'enabled' | 'stock', value: any) => {
    const updated = [...variantsState];
    // @ts-ignore
    updated[index][field] = value;
    setVariantsState(updated);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\s/g, '');
    if (!value.startsWith('€')) {
        const numberPart = value.replace(/[^0-9.,]/g, '');
        value = '€' + numberPart;
    }
    setNewProduct({ ...newProduct, price: value });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || newProduct.price === '€') return;

    const finalVariants: ProductVariant[] = variantsState.filter(v => v.enabled).map(v => ({ size: v.size, stock: parseInt(v.stock) || 0 }));
    const sizeString = finalVariants.map(v => v.size).join(' - ');
    const productToAdd: Product = {
      id: Date.now().toString(),
      title: newProduct.title || 'Untitled',
      season: newProduct.season || 'Concept',
      price: newProduct.price || '€0',
      imageUrl: newProduct.imageUrl || 'https://via.placeholder.com/400x500?text=No+Image',
      size: sizeString,
      condition: newProduct.condition || 'Nuova',
      description: newProduct.description || '',
      isSoldOut: finalVariants.every(v => v.stock === 0),
      tags: newProduct.tags || [],
      instagramUrl: newProduct.instagramUrl || '',
      dropDate: newProduct.dropDate || undefined,
      variants: finalVariants
    };
    
    addProduct(productToAdd);
    setNewProduct({ title: '', season: '', price: '€', imageUrl: '', condition: 'Nuova', description: '', isSoldOut: false, tags: [], instagramUrl: '', dropDate: '' });
    showToast('Prodotto aggiunto al catalogo!');
  };

  // --- DELETE HANDLERS ---
  const handleDeleteProduct = (id: string) => confirmAction('Elimina Prodotto', 'Sei sicuro di voler eliminare definitivamente questo prodotto?', () => deleteProduct(id));
  const handleDeleteOrder = (id: string) => confirmAction('Elimina Ordine', 'Questa azione non può essere annullata. Confermi?', () => deleteOrder(id));
  const handleDeleteDiscount = (id: string) => confirmAction('Rimuovi Promozione', 'Vuoi davvero cancellare questa promozione?', () => deleteDiscount(id));
  const handleDeleteFaq = (id: string) => confirmAction('Elimina FAQ', 'Rimuovere questa domanda dalle FAQ?', () => deleteFaq(id));

  // --- CONFIG HANDLERS (Usano showToast invece di alert) ---
  const handleShippingSubmit = (e: React.FormEvent) => { e.preventDefault(); setShippingConfig(shippingForm); showToast('Regole spedizione aggiornate!'); };
  const handlePaymentSubmit = (e: React.FormEvent) => { e.preventDefault(); setStripeConfig(paymentForm); showToast('Configurazione Stripe salvata!'); };
  const handleMailSubmit = (e: React.FormEvent) => { e.preventDefault(); setMailConfig(mailForm); showToast('Parametri Email salvati!'); };
  const handleSupportSubmit = (e: React.FormEvent) => { e.preventDefault(); setSupportConfig({ whatsappNumber: whatsappNum }); showToast('Numero WhatsApp aggiornato!'); };
  
  const handleAddFaq = () => { 
      if(!newFaq.question || !newFaq.answer) return; 
      addFaq({ id: Date.now().toString(), ...newFaq }); 
      setNewFaq({ question: '', answer: '' }); 
      showToast('FAQ aggiunta con successo!');
  };
  
  const handleDiscountSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newDiscount.name || !newDiscount.percentage) return;
      const endDate = new Date(discountDates.end);
      endDate.setHours(23, 59, 59, 999);
      const discount: Discount = {
          id: Date.now().toString(),
          name: newDiscount.name,
          percentage: Number(newDiscount.percentage),
          startDate: new Date(discountDates.start).toISOString(),
          endDate: endDate.toISOString(),
          targetType: newDiscount.targetType as 'all' | 'specific',
          targetProductIds: newDiscount.targetProductIds || [],
          isActive: true
      };
      addDiscount(discount);
      setNewDiscount({ name: '', percentage: 20, targetType: 'all', targetProductIds: [], isActive: true });
      showToast('Nuova promozione attivata!');
  };

  const toggleProductInDiscount = (productId: string) => {
      const currentIds = newDiscount.targetProductIds || [];
      if (currentIds.includes(productId)) {
          setNewDiscount({ ...newDiscount, targetProductIds: currentIds.filter(id => id !== productId) });
      } else {
          setNewDiscount({ ...newDiscount, targetProductIds: [...currentIds, productId] });
      }
  };

  // --- STYLES ---
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-base placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2";
  const actionButtonClass = "w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#0066b2] hover:shadow-lg hover:shadow-[#0066b2]/30 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer";

  const tabLabels: Record<string, string> = { 
      products: 'Prodotti', 
      orders: 'Ordini', 
      shipping: 'Spedizioni', 
      payments: 'Pagamenti', 
      support: 'Supporto', 
      faq: 'FAQ', // Nuova Label
      promotions: 'Promozioni' 
  };
  
  const getStatusBadge = (status: OrderStatus) => {
      switch(status) {
          case 'paid': return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><CheckCircle size={12}/> Pagato</span>;
          case 'shipped': return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><Truck size={12}/> Spedito</span>;
          case 'delivered': return <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><Package size={12}/> Consegnato</span>;
          case 'cancelled': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><XCircle size={12}/> Annullato</span>;
          default: return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><Clock size={12}/> In Attesa</span>;
      }
  };

  return (
    <section className="pt-64 pb-24 bg-slate-50 min-h-screen relative">
      
      {/* GLOBAL TOAST */}
      <Toast message={toast.msg} show={toast.show} />

      {/* CONFIRM MODAL */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen} title={modalConfig.title} message={modalConfig.message}
        onConfirm={modalConfig.onConfirm} onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* HEADER CENTRATO E STILIZZATO */}
        <div className="text-center mb-16 relative">
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-2 text-slate-900">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Dashboard</span>
            </h2>
            <p className="text-slate-500 text-sm tracking-widest uppercase font-bold">Pannello di controllo</p>
            
            {/* Logout Button (Absolute position for desktop, centered for mobile) */}
            <div className="mt-6 md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2 md:mt-0 flex justify-center">
                <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm font-bold uppercase tracking-wider text-xs transform active:scale-95">
                    <LogOut size={14} /> Esci
                </button>
            </div>
        </div>

        <div className="flex gap-4 mb-12 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar justify-start md:justify-center">
            {['products', 'orders', 'shipping', 'payments', 'support', 'faq', 'promotions'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-4 transition-all whitespace-nowrap ${activeTab === tab ? 'border-[#0066b2] text-[#0066b2]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                    {tab === 'products' && <Package size={18} />}
                    {tab === 'orders' && <ShoppingBag size={18} />}
                    {tab === 'shipping' && <Plane size={18} />}
                    {tab === 'payments' && <CreditCard size={18} />}
                    {tab === 'support' && <MessageCircle size={18} />}
                    {tab === 'faq' && <HelpCircle size={18} />}
                    {tab === 'promotions' && <Tag size={18} />}
                    {tabLabels[tab]}
                </button>
            ))}
        </div>

        {/* --- SUPPORT TAB (WhatsApp & Email Side-by-Side) --- */}
        {activeTab === 'support' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* WhatsApp Config */}
                 <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]">
                        <MessageCircle size={28} /> Configurazione WhatsApp
                    </h3>
                    <form onSubmit={handleSupportSubmit} className="space-y-6">
                        <div>
                            <label className={labelClass}>Numero Business (con prefisso)</label>
                            <input 
                                type="text" 
                                className={inputClass}
                                value={whatsappNum}
                                onChange={e => setWhatsappNum(e.target.value)}
                                placeholder="393331234567"
                            />
                        </div>
                        <button type="submit" className={actionButtonClass}>
                            <Save size={18} /> Salva Numero
                        </button>
                    </form>
                 </div>

                 {/* Mail Config */}
                 <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]">
                        <Mail size={28} /> Configurazione Email
                    </h3>
                    <form onSubmit={handleMailSubmit} className="space-y-6">
                        <div>
                            <label className={labelClass}>Indirizzo Ricezione</label>
                            <input 
                                type="email" 
                                className={inputClass}
                                value={mailForm.emailTo}
                                onChange={e => setMailForm({...mailForm, emailTo: e.target.value})}
                                placeholder="info@tacalabala.it"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className={labelClass}>Service ID / Host SMTP</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={mailForm.serviceId}
                                    onChange={e => setMailForm({...mailForm, serviceId: e.target.value})}
                                    placeholder="smtp.gmail.com"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass}>Porta</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={mailForm.templateId}
                                    onChange={e => setMailForm({...mailForm, templateId: e.target.value})}
                                    placeholder="587"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Public Key / Password</label>
                            <input 
                                type="password" 
                                className={inputClass}
                                value={mailForm.publicKey}
                                onChange={e => setMailForm({...mailForm, publicKey: e.target.value})}
                                placeholder="Inserisci la chiave segreta"
                            />
                        </div>
                        <button type="submit" className={actionButtonClass}>
                            <Save size={18} /> Salva Configurazione
                        </button>
                    </form>
                 </div>
            </div>
        )}

        {/* --- FAQ TAB (Nuova Sezione Separata) --- */}
        {activeTab === 'faq' && (
             <div className="max-w-4xl mx-auto">
                 <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-oswald text-2xl uppercase flex items-center gap-3 text-[#0066b2]">
                            <HelpCircle size={28} /> Gestione FAQ
                        </h3>
                        <span className="text-xs font-bold uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                            Domande: {supportConfig.faqs.length}
                        </span>
                    </div>

                    <div className="mb-12 bg-slate-50 p-8 rounded-[1.5rem] border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm border-b border-slate-200 pb-2">Aggiungi Nuova Domanda</h4>
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Domanda</label>
                                <input 
                                    type="text" 
                                    placeholder="Es. Quali sono i tempi di spedizione?" 
                                    className={`${inputClass} bg-white`} 
                                    value={newFaq.question} 
                                    onChange={e => setNewFaq({...newFaq, question: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Risposta</label>
                                <textarea 
                                    placeholder="Es. Spediamo in 24/48 ore..." 
                                    rows={3} 
                                    className={`${inputClass} bg-white`} 
                                    value={newFaq.answer} 
                                    onChange={e => setNewFaq({...newFaq, answer: e.target.value})} 
                                />
                            </div>
                            <button onClick={handleAddFaq} className={actionButtonClass}>
                                <Plus size={18} /> Aggiungi alla lista
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className={labelClass}>Domande Attive</label>
                        {supportConfig.faqs.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                Nessuna FAQ presente. Aggiungine una sopra.
                            </div>
                        ) : (
                            supportConfig.faqs.map(faq => (
                                <div key={faq.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-start hover:shadow-lg transition-all group">
                                    <div className="pr-8">
                                        <h4 className="font-bold text-lg text-slate-900 mb-2">{faq.question}</h4>
                                        <p className="text-slate-500 leading-relaxed text-sm">{faq.answer}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteFaq(faq.id)} 
                                        className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0"
                                        title="Rimuovi"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
             </div>
        )}

        {/* --- SHIPPING TAB --- */}
        {activeTab === 'shipping' && (
             <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
                <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]">
                    <Plane size={28} /> Regole di Spedizione
                </h3>
                <form onSubmit={handleShippingSubmit} className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><img src="https://flagcdn.com/w20/it.png" alt="IT" className="rounded-sm shadow-sm"/> Spedizione Italia</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Costo Standard (€)</label><input type="number" className={inputClass} value={shippingForm.italyPrice} onChange={e => setShippingForm({...shippingForm, italyPrice: parseFloat(e.target.value)})} /></div>
                            <div><label className={labelClass}>Gratis oltre (€)</label><input type="number" className={inputClass} value={shippingForm.italyThreshold} onChange={e => setShippingForm({...shippingForm, italyThreshold: parseFloat(e.target.value)})} /></div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">🌍 Spedizione Estero</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Costo Standard (€)</label><input type="number" className={inputClass} value={shippingForm.foreignPrice} onChange={e => setShippingForm({...shippingForm, foreignPrice: parseFloat(e.target.value)})} /></div>
                            <div><label className={labelClass}>Gratis oltre (€)</label><input type="number" className={inputClass} value={shippingForm.foreignThreshold} onChange={e => setShippingForm({...shippingForm, foreignThreshold: parseFloat(e.target.value)})} /></div>
                        </div>
                    </div>
                    <button type="submit" className={actionButtonClass}><Save size={18} /> Salva Regole</button>
                </form>
            </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]"><Plus size={28} /> Aggiungi Maglia</h3>
                    <form onSubmit={handleProductSubmit} className="space-y-5">
                        <div><label className={labelClass}>Titolo</label><input type="text" className={inputClass} value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="Es. Inter Snake" required /></div>
                        <div><label className={labelClass}>Stagione</label><input type="text" className={inputClass} value={newProduct.season} onChange={e => setNewProduct({...newProduct, season: e.target.value})} placeholder="Es. Streetwear Edition" /></div>
                        
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <label className={`${labelClass} text-[#0066b2]`}>Data Drop (Opzionale)</label>
                            <input type="datetime-local" className={`${inputClass} bg-white`} value={newProduct.dropDate} onChange={e => setNewProduct({...newProduct, dropDate: e.target.value})} />
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><label className={labelClass}>Taglie & Stock</label><div className="space-y-4">{variantsState.map((v, idx) => (<div key={v.size} className="flex items-center gap-4"><input type="checkbox" checked={v.enabled} onChange={(e) => handleVariantChange(idx, 'enabled', e.target.checked)} className="w-5 h-5 rounded text-[#0066b2] cursor-pointer" /><span className="text-base font-bold w-8">{v.size}</span><input type="number" disabled={!v.enabled} value={v.stock} onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)} className={`w-full p-3 text-sm border rounded-lg outline-none focus:border-[#0066b2] ${!v.enabled ? 'bg-slate-100 text-slate-300' : 'bg-white border-slate-300'}`} placeholder="Qty" /></div>))}</div></div>
                        <div className="grid grid-cols-2 gap-5"><div><label className={labelClass}>Prezzo</label><input type="text" className={inputClass} value={newProduct.price} onChange={handlePriceChange} placeholder="€" required /></div></div>
                        <div><label className={labelClass}>URL Immagine</label><input type="text" className={inputClass} value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://..." /></div>
                        <div><label className={labelClass}>Link Instagram</label><input type="text" className={inputClass} value={newProduct.instagramUrl} onChange={e => setNewProduct({...newProduct, instagramUrl: e.target.value})} /></div>
                        <div><label className={labelClass}>Descrizione</label><textarea className={inputClass} rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} /></div>
                        <button type="submit" className={actionButtonClass}><Plus size={18} />Aggiungi maglia</button>
                    </form>
                </div>
                <div className="lg:col-span-2">
                     <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 min-h-full">
                         <div className="flex justify-between items-center mb-8"><h3 className="font-oswald text-2xl uppercase flex items-center gap-3 text-[#0066b2]"><Package size={28} /> Gestione Inventario</h3><div className="bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold uppercase text-slate-500">Totale Modelli: {products.length}</div></div>
                         {products.length === 0 ? (<div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50"><Package size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest">Il magazzino è vuoto</p><p className="text-xs text-slate-400 mt-2">Aggiungi il primo prodotto usando il form a sinistra</p></div>) : (
                             <div className="space-y-6">
                                 {products.map(product => {
                                     const priceInfo = calculatePrice(product);
                                     const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
                                     const isLowStock = totalStock > 0 && totalStock < 5;
                                     const isDrop = product.dropDate && new Date(product.dropDate) > new Date();
                                     return (
                                     <div key={product.id} className="group relative border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-100">
                                         <button onClick={() => handleDeleteProduct(product.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100" title="Elimina dal catalogo"><Trash2 size={20} /></button>
                                         <div className="flex flex-col md:flex-row gap-6">
                                             <div className="flex gap-5 md:w-1/2">
                                                 <div className="w-24 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative"><img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />{product.isSoldOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-[10px] font-bold uppercase border border-white px-2 py-1 rounded">Sold Out</span></div>)}{isDrop && (<div className="absolute top-0 left-0 w-full bg-purple-600 text-white text-[8px] font-bold uppercase text-center py-1">Drop: {new Date(product.dropDate!).toLocaleDateString()}</div>)}</div>
                                                 <div><div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-lg text-slate-900 leading-tight">{product.title}</h4>{isLowStock && !product.isSoldOut && <AlertCircle size={16} className="text-orange-500" />}</div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">{product.season}</p><div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">{priceInfo.hasDiscount ? (<><span className="text-slate-400 line-through text-xs font-mono">{product.price}</span><span className="text-[#0066b2] font-bold text-sm">€{priceInfo.finalPrice.toFixed(2)}</span></>) : (<span className="text-[#0066b2] font-bold text-sm">{product.price}</span>)}</div></div>
                                             </div>
                                             <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                                                 <label className={`${labelClass} mb-3`}>Disponibilità per Taglia</label>
                                                 <div className="grid grid-cols-4 gap-2 mb-3">
                                                    {product.variants?.map(v => {
                                                        let stockColor = "bg-green-50 border-green-200 text-green-700"; if (v.stock === 0) stockColor = "bg-slate-50 border-slate-200 text-slate-300"; else if (v.stock < 3) stockColor = "bg-orange-50 border-orange-200 text-orange-700";
                                                        return (<div key={v.size} className={`border rounded-lg p-2 text-center flex flex-col items-center justify-center transition-colors ${stockColor}`}><span className="text-[10px] font-bold uppercase opacity-60 mb-0.5">{v.size}</span><span className="text-sm font-bold font-mono leading-none">{v.stock}</span></div>);
                                                    })}
                                                 </div>
                                                 <div className="text-right"><span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${totalStock === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>Totale Magazzino: {totalStock} pz</span></div>
                                             </div>
                                         </div>
                                     </div>
                                 )})}
                             </div>
                         )}
                     </div>
                </div>
            </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
            <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-8"><h3 className="font-oswald text-2xl uppercase flex items-center gap-3 text-[#0066b2]"><ShoppingBag size={28} /> Ordini Recenti</h3><div className="text-sm font-bold text-slate-500">Totale: {orders.length}</div></div>
                <div className="space-y-6">
                    {orders.length === 0 ? (<div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed"><ShoppingBag size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold uppercase tracking-wider">Nessun ordine ricevuto</p></div>) : (
                        orders.map(order => (
                            <div key={order.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-slate-50/50">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1"><div className="flex items-center gap-3 mb-2"><span className="font-oswald font-bold text-xl">#{order.id}</span>{getStatusBadge(order.status)}</div><p className="text-xs text-slate-400 font-mono mb-4">{new Date(order.date).toLocaleString()}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div><p className="text-[10px] font-bold uppercase text-slate-400">Cliente</p><p className="font-bold text-slate-800">{order.customerName || 'N/D'}</p><p className="text-slate-500">{order.customerEmail}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-400">Spedizione</p><p className="text-slate-600">{order.shippingAddress || 'Indirizzo non presente'}</p></div></div></div>
                                    <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6"><p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Articoli</p><div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">{order.items.map((item, idx) => (<div key={idx} className="flex justify-between items-center text-sm"><span className="text-slate-600"><span className="font-bold">{item.quantity}x</span> {item.title} ({item.selectedSize})</span></div>))}</div><div className="flex justify-between items-center pt-3 border-t border-slate-200"><span className="font-bold uppercase text-xs">Totale</span><span className="font-oswald font-bold text-xl text-[#0066b2]">€{order.total.toFixed(2)}</span></div></div>
                                    <div className="flex flex-col justify-between gap-2 min-w-[160px]">
                                        <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Aggiorna Stato</label><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold uppercase outline-none focus:border-[#0066b2]"><option value="pending">In Attesa</option><option value="paid">Pagato</option><option value="shipped">Spedito</option><option value="delivered">Consegnato</option><option value="cancelled">Annullato</option></select></div>
                                        <button onClick={() => handleDeleteOrder(order.id)} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase"><Trash2 size={14} /> Elimina Ordine</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* --- PAYMENTS TAB --- */}
        {activeTab === 'payments' && (
            <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100">
                <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]"><CreditCard size={28} /> Configurazione Stripe</h3>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="flex items-center gap-3 bg-blue-50 p-6 rounded-2xl text-sm text-[#0066b2] mb-6"><CreditCard size={24} /><p className="font-medium">Questi dati verranno utilizzati per processare i pagamenti sicuri nel checkout.</p></div>
                    <div><label className={labelClass}>Stripe Public Key</label><input type="text" className={inputClass} value={paymentForm.publicKey} onChange={e => setPaymentForm({...paymentForm, publicKey: e.target.value})} placeholder="pk_test_..." /></div>
                    <div><label className={labelClass}>Stripe Secret Key</label><input type="password" className={inputClass} value={paymentForm.secretKey} onChange={e => setPaymentForm({...paymentForm, secretKey: e.target.value})} placeholder="sk_test_..." /></div>
                    <div><label className={labelClass}>Webhook Secret</label><input type="password" className={inputClass} value={paymentForm.webhookSecret} onChange={e => setPaymentForm({...paymentForm, webhookSecret: e.target.value})} placeholder="whsec_..." /></div>
                    
                    <div><label className={labelClass}>Modalità Pagamenti</label><div className="flex bg-slate-100 p-1 rounded-xl">
                            <button type="button" onClick={() => setPaymentForm({...paymentForm, isEnabled: false})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${!paymentForm.isEnabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Test Mode (Sandbox)</button>
                            <button type="button" onClick={() => setPaymentForm({...paymentForm, isEnabled: true})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${paymentForm.isEnabled ? 'bg-[#0066b2] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Live (Attivi)</button>
                        </div></div>
                    <button type="submit" className={actionButtonClass}><Save size={18} /> Salva Configurazione</button>
                </form>
            </div>
        )}

        {/* --- PROMOTIONS TAB --- */}
        {activeTab === 'promotions' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]"><Tag size={28} /> Crea Promozione</h3>
                    <form onSubmit={handleDiscountSubmit} className="space-y-6">
                        <div><label className={labelClass}>Nome Promozione</label><input type="text" className={inputClass} value={newDiscount.name} onChange={e => setNewDiscount({...newDiscount, name: e.target.value})} placeholder="Es. Black Friday" required /></div>
                        <div><label className={labelClass}>Percentuale Sconto (%)</label><input type="number" className={inputClass} value={newDiscount.percentage} onChange={e => setNewDiscount({...newDiscount, percentage: Number(e.target.value)})} placeholder="20" required min="1" max="100" /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>Data Inizio</label><input type="date" className={inputClass} value={discountDates.start} onChange={e => setDiscountDates({...discountDates, start: e.target.value})} required /></div><div><label className={labelClass}>Data Fine</label><input type="date" className={inputClass} value={discountDates.end} onChange={e => setDiscountDates({...discountDates, end: e.target.value})} required /></div></div>
                        <div>
                            <label className={labelClass}>Applica A</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setNewDiscount({...newDiscount, targetType: 'all'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${newDiscount.targetType === 'all' ? 'bg-white text-[#0066b2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Tutto il catalogo</button>
                                <button type="button" onClick={() => setNewDiscount({...newDiscount, targetType: 'specific'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${newDiscount.targetType === 'specific' ? 'bg-white text-[#0066b2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Prodotti Specifici</button>
                            </div>
                            {newDiscount.targetType === 'specific' && (
                                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 mt-4">
                                    {products.map(p => (
                                        <div key={p.id} onClick={() => toggleProductInDiscount(p.id)} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newDiscount.targetProductIds?.includes(p.id) ? 'bg-[#0066b2] border-[#0066b2]' : 'border-slate-300'}`}>{newDiscount.targetProductIds?.includes(p.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}</div><img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" /><span className="text-sm font-bold text-slate-700">{p.title}</span></div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className={actionButtonClass}><Save size={18} /> Salva Promozione</button>
                    </form>
                </div>
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
                    <h3 className="font-oswald text-2xl uppercase mb-8 flex items-center gap-3 text-[#0066b2]"><Calendar size={28} /> Promozioni Attive</h3>
                    <div className="space-y-4">
                        {discounts.map(d => {
                            const now = new Date(); const start = new Date(d.startDate); const end = new Date(d.endDate); const isActive = now >= start && now <= end && d.isActive;
                            return (
                                <div key={d.id} className={`p-6 border rounded-2xl relative ${isActive ? 'bg-blue-50 border-[#0066b2]' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                    <div className="flex justify-between items-start">
                                        <div><h4 className="font-oswald font-bold text-xl uppercase">{d.name}</h4><div className="flex items-center gap-2 mt-1"><span className="text-2xl font-bold text-[#0066b2]">-{d.percentage}%</span><span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{d.targetType === 'all' ? 'Tutto il sito' : 'Prodotti Selezionati'}</span></div><p className="text-xs text-slate-500 mt-2 font-mono">{start.toLocaleDateString()} - {end.toLocaleDateString()}</p></div>
                                        <button onClick={() => handleDeleteDiscount(d.id)} className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                    {!isActive && <div className="absolute top-4 right-14 text-[10px] font-bold uppercase text-slate-400 bg-slate-200 px-2 py-1 rounded">{now > end ? 'Scaduta' : 'Programmata'}</div>}
                                </div>
                            );
                        })}
                        {discounts.length === 0 && <p className="text-center text-slate-400 italic">Nessuna promozione attiva.</p>}
                    </div>
                </div>
             </div>
        )}
      </div>
    </section>
  );
};

export default Admin;