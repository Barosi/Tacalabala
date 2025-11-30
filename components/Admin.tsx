
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Size, FAQ, Discount, OrderStatus, ShippingConfig } from '../types';
import { Plus, Trash2, LogOut, Package, CreditCard, Save, MessageCircle, HelpCircle, Tag, Calendar, ShoppingBag, Truck, CheckCircle, XCircle, AlertCircle, Clock, Mail, Plane, AlertTriangle, Check, Search, Shirt, Layers, Globe, Smartphone, PenTool, FileText, ChevronDown, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

// --- STILI CONDIVISI PER UNIFORMITÀ ---
const cardClass = "bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden transition-all duration-300 hover:shadow-blue-900/10";
const headerIconClass = "w-14 h-14 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0";
const headerTitleClass = "font-oswald text-3xl uppercase font-bold text-slate-900";
const headerSubtitleClass = "text-slate-500 text-sm font-medium mt-1";
const sectionHeaderClass = "font-bold text-slate-900 flex items-center gap-2 uppercase text-sm tracking-wider mb-6 pb-2 border-b border-slate-100";
const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-base placeholder:text-slate-400";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1";

// UPDATED BUTTON STYLE: Icon Left, Rounded Full, Smooth Hover
const actionButtonClass = "relative overflow-hidden group/btn bg-white border border-slate-900 text-slate-900 hover:text-white py-4 px-12 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-3 transform-gpu active:scale-95 cursor-pointer shadow-sm hover:shadow-lg";

// Helper for button content to allow liquid fill
const ActionButtonContent = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <>
        <span className="absolute inset-0 bg-slate-900 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"></span>
        <span className="relative z-10 flex items-center gap-3">
            <Icon size={18} /> {text}
        </span>
    </>
);

// Stile Pulsante Eliminazione (Neutro -> Rosso)
const deleteBtnClass = "w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm z-10";
// Stile Pulsante Fattura (Neutro -> Viola)
const invoiceBtnClass = "w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm z-10";

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
    updateOrderStatus, deleteOrder,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'shipping' | 'payments' | 'support' | 'faq' | 'promotions'>('products');
  
  const [toast, setToast] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const showToast = (msg: string) => {
      setToast({ show: true, msg });
      setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const confirmAction = (title: string, message: string, action: () => void) => {
      setModalConfig({
          isOpen: true, title, message,
          onConfirm: () => { action(); setModalConfig(prev => ({ ...prev, isOpen: false })); }
      });
  };

  // --- STATE PAGINAZIONE ORDINI ---
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // --- STATE PRODOTTI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '', 
    articleCode: '',
    brand: 'Nike',
    kitType: '', // Text field ora
    year: '',
    season: '', 
    price: '€', 
    imageUrl: '', 
    condition: 'Nuovo con etichetta', 
    description: '', 
    isSoldOut: false, 
    tags: [], 
    instagramUrl: '', 
    dropDate: ''
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

  useEffect(() => { if (stripeConfig) setPaymentForm(stripeConfig); }, [stripeConfig]);
  useEffect(() => { if (shippingConfig) setShippingForm(shippingConfig); }, [shippingConfig]);
  useEffect(() => { if (supportConfig.whatsappNumber) setWhatsappNum(supportConfig.whatsappNumber); }, [supportConfig.whatsappNumber]);
  useEffect(() => { if (mailConfig) setMailForm(mailConfig); }, [mailConfig]);
  
  // Reset pagination when tab changes or search/filter changes (future proof)
  useEffect(() => { setCurrentOrderPage(1); }, [activeTab]);

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
      articleCode: newProduct.articleCode || `SKU-${Date.now()}`,
      title: newProduct.title || 'Untitled',
      brand: newProduct.brand || 'Generic',
      kitType: newProduct.kitType || 'Home',
      year: newProduct.year || new Date().getFullYear().toString(),
      season: newProduct.season || 'Classic',
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
    setNewProduct({ 
        title: '', articleCode: '', brand: 'Nike', kitType: '', year: '', season: '', 
        price: '€', imageUrl: '', condition: 'Nuovo con etichetta', description: '', 
        isSoldOut: false, tags: [], instagramUrl: '', dropDate: '' 
    });
    showToast('Prodotto aggiunto al catalogo!');
  };

  const toggleExpandProduct = (id: string) => {
      setExpandedProductId(prev => prev === id ? null : id);
  };

  const handleDeleteProduct = (id: string) => confirmAction('Elimina Prodotto', 'Sei sicuro di voler eliminare definitivamente questo prodotto?', () => deleteProduct(id));
  const handleDeleteOrder = (id: string) => confirmAction('Elimina Ordine', 'Questa azione non può essere annullata. Confermi?', () => deleteOrder(id));
  const handleDeleteDiscount = (id: string) => confirmAction('Rimuovi Promozione', 'Vuoi davvero cancellare questa promozione?', () => deleteDiscount(id));
  const handleDeleteFaq = (id: string) => confirmAction('Elimina FAQ', 'Rimuovere questa domanda dalle FAQ?', () => deleteFaq(id));

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

  const filteredProducts = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.articleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabLabels: Record<string, string> = { products: 'Prodotti', orders: 'Ordini', shipping: 'Spedizioni', payments: 'Pagamenti', support: 'Supporto', faq: 'FAQ', promotions: 'Promozioni' };
  
  // Funzione per ottenere il colore del badge in base allo stato
  const getStatusColor = (status: OrderStatus) => {
      switch(status) {
          case 'paid': return 'text-green-700 bg-green-50 border-green-200';
          case 'shipped': return 'text-blue-700 bg-blue-50 border-blue-200';
          case 'delivered': return 'text-purple-700 bg-purple-50 border-purple-200';
          case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
          default: return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      }
  };

  return (
    <section className="pt-32 md:pt-48 pb-16 md:pb-24 bg-slate-50 min-h-screen relative">
      <Toast message={toast.msg} show={toast.show} />
      <ConfirmationModal 
        isOpen={modalConfig.isOpen} title={modalConfig.title} message={modalConfig.message}
        onConfirm={modalConfig.onConfirm} onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* HEADER */}
        <div className="text-center mb-16 relative">
            <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-2 text-slate-900">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Dashboard</span>
            </h2>
            <p className="text-slate-500 text-sm tracking-widest uppercase font-bold">Pannello di controllo avanzato</p>
            <div className="mt-6 md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2 md:mt-0 flex justify-center">
                <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm font-bold uppercase tracking-wider text-xs transform active:scale-95">
                    <LogOut size={14} /> Esci
                </button>
            </div>
        </div>

        {/* TABS */}
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

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
            <div className="space-y-16 animate-in fade-in duration-500">
                {/* 1. SEZIONE INSERIMENTO (NUOVO LAYOUT) */}
                <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}>
                            <Plus size={32} />
                        </div>
                        <div>
                            <h3 className={headerTitleClass}>Nuova Inserzione</h3>
                            <p className={headerSubtitleClass}>Aggiungi una nuova maglia al catalogo.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProductSubmit}>
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                            
                            {/* COLONNA 1: DATI MAGLIA */}
                            <div className="space-y-6">
                                <h4 className={sectionHeaderClass}><Shirt size={16}/> Dati Maglia</h4>
                                
                                <div><label className={labelClass}>Titolo Prodotto</label><input type="text" className={inputClass} value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="Es. Inter Home 1998" required /></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Tipo Kit</label><input type="text" className={inputClass} value={newProduct.kitType} onChange={e => setNewProduct({...newProduct, kitType: e.target.value})} placeholder="Home, Away..." /></div>
                                    <div><label className={labelClass}>Anno</label><input type="text" className={inputClass} value={newProduct.year} onChange={e => setNewProduct({...newProduct, year: e.target.value})} placeholder="Es. 1997/98" /></div>
                                </div>

                                <div><label className={labelClass}>Label Visuale</label><input type="text" className={inputClass} value={newProduct.season} onChange={e => setNewProduct({...newProduct, season: e.target.value})} placeholder="Es. Vintage, Concept" /></div>
                                
                                <div><label className={labelClass}>Descrizione</label><textarea className={inputClass} rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Storia della maglia..." /></div>
                            </div>

                            {/* COLONNA 2: VENDITA & MEDIA */}
                            <div className="space-y-6">
                                <h4 className={sectionHeaderClass}><Tag size={16}/> Vendita & Media</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Prezzo (€)</label><input type="text" className={inputClass} value={newProduct.price} onChange={handlePriceChange} placeholder="€0.00" required /></div>
                                    <div><label className={labelClass}>SKU (Opzionale)</label><input type="text" className={inputClass} value={newProduct.articleCode} onChange={e => setNewProduct({...newProduct, articleCode: e.target.value})} placeholder="INT-98-H" /></div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <label className={`${labelClass} text-[#0066b2] mb-1`}>Data Drop (Coming Soon)</label>
                                    <input type="datetime-local" className={`${inputClass} bg-white text-sm`} value={newProduct.dropDate} onChange={e => setNewProduct({...newProduct, dropDate: e.target.value})} />
                                </div>

                                <div><label className={labelClass}>URL Immagine</label><input type="text" className={inputClass} value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://..." /></div>
                                <div><label className={labelClass}>Link Instagram</label><input type="text" className={inputClass} value={newProduct.instagramUrl} onChange={e => setNewProduct({...newProduct, instagramUrl: e.target.value})} placeholder="URL Post" /></div>
                                
                                {/* Campi nascosti ma necessari per il tipo Product */}
                                <div className="hidden">
                                    <select value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})}><option>Nike</option></select>
                                    <select value={newProduct.condition} onChange={e => setNewProduct({...newProduct, condition: e.target.value})}><option>Nuovo</option></select>
                                </div>
                            </div>

                            {/* COLONNA 3: INVENTARIO */}
                            <div className="space-y-6">
                                <h4 className={sectionHeaderClass}><Layers size={16}/> Stock & Varianti</h4>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
                                    <div className="space-y-4">
                                        {variantsState.map((v, idx) => (
                                            <div key={v.size} className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 w-20">
                                                    <input type="checkbox" checked={v.enabled} onChange={(e) => handleVariantChange(idx, 'enabled', e.target.checked)} className="w-5 h-5 rounded text-[#0066b2] cursor-pointer accent-[#0066b2]" />
                                                    <span className={`text-sm font-bold ${v.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{v.size}</span>
                                                </div>
                                                <input type="number" disabled={!v.enabled} value={v.stock} onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)} className={`flex-1 p-3 text-sm border rounded-lg outline-none focus:border-[#0066b2] transition-colors ${!v.enabled ? 'bg-slate-100 text-slate-300' : 'bg-white border-slate-300'}`} placeholder="Qty" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* BOTTONE CENTRALE */}
                        <div className="flex justify-center border-t border-slate-100 pt-8">
                             <button type="submit" className={actionButtonClass}>
                                 <ActionButtonContent icon={Plus} text="Pubblica Articolo" />
                             </button>
                        </div>
                    </form>
                </div>

                {/* 2. SEZIONE INVENTARIO */}
                <div className={cardClass}>
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6 border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-4">
                            <div className={headerIconClass}>
                                <Package size={32} />
                            </div>
                            <div>
                                <h3 className={headerTitleClass}>Magazzino</h3>
                                <p className={headerSubtitleClass}>{products.length} Articoli totali.</p>
                            </div>
                        </div>
                        
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cerca..." 
                                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#0066b2] transition-colors font-medium text-slate-900"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest">Nessun prodotto trovato</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
                                const isExpanded = expandedProductId === product.id;

                                return (
                                    <div 
                                        key={product.id} 
                                        className={`bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#0066b2] shadow-xl' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                                    >
                                        {/* Riga Cliccabile */}
                                        <div 
                                            className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer group"
                                            onClick={() => toggleExpandProduct(product.id)}
                                        >
                                            <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-200">
                                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1 group-hover:text-[#0066b2] transition-colors">{product.title}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">{product.kitType} • {product.year}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 pl-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-center">
                                                    <span className="block text-[10px] font-bold uppercase text-slate-400">Prezzo</span>
                                                    <span className="font-oswald font-bold text-lg text-[#0066b2]">{product.price}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[10px] font-bold uppercase text-slate-400">Stock Totale</span>
                                                    <span className={`font-mono font-bold text-lg ${totalStock < 5 ? 'text-orange-500' : 'text-slate-900'}`}>{totalStock}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} 
                                                        className={deleteBtnClass}
                                                        title="Elimina Prodotto"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pannello Espandibile Dettagli Stock */}
                                        {isExpanded && (
                                            <div className="bg-slate-50 border-t border-slate-100 p-6 md:p-8 animate-in slide-in-from-top-2 fade-in">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Layers size={16} className="text-[#0066b2]" />
                                                    <h5 className="font-bold uppercase text-xs tracking-widest text-slate-500">Dettaglio Disponibilità per Taglia</h5>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {product.variants?.map((v, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`flex items-center justify-between p-4 rounded-xl border ${v.stock > 0 ? 'bg-white border-slate-200' : 'bg-red-50 border-red-100 opacity-70'}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${v.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-white text-red-400'}`}>
                                                                    {v.size}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block text-[10px] font-bold uppercase text-slate-400">Qtà</span>
                                                                <span className={`font-mono font-bold text-lg ${v.stock > 0 ? 'text-[#0066b2]' : 'text-red-500'}`}>
                                                                    {v.stock}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!product.variants || product.variants.length === 0) && (
                                                        <p className="text-sm text-slate-400 italic">Nessuna variante configurata.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDERS TAB (COMPLETELY REDESIGNED & PAGINATED) --- */}
        {activeTab === 'orders' && (
            <div className={cardClass}>
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                    <div className={headerIconClass}><ShoppingBag size={32} /></div>
                    <div><h3 className={headerTitleClass}>Ordini Recenti</h3><p className={headerSubtitleClass}>Gestisci gli ordini ricevuti.</p></div>
                </div>
                
                <div className="space-y-6">
                    {(() => {
                        const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
                        const startOrderIdx = (currentOrderPage - 1) * ORDERS_PER_PAGE;
                        const currentOrders = orders.slice(startOrderIdx, startOrderIdx + ORDERS_PER_PAGE);

                        if (orders.length === 0) {
                            return (
                                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold uppercase tracking-wider text-sm">Nessun ordine in archivio</p>
                                </div>
                            );
                        }

                        return (
                            <>
                                {currentOrders.map(order => (
                                    <div key={order.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                                        
                                        {/* 1. HEADER: ID & DATE */}
                                        <div className="bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                                    <ShoppingBag size={18} />
                                                </div>
                                                <div>
                                                    <span className="font-oswald font-bold text-xl text-slate-900 tracking-wide">#{order.id}</span>
                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(order.date).toLocaleString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {order.status === 'paid' && 'Pagato'}
                                                {order.status === 'shipped' && 'Spedito'}
                                                {order.status === 'delivered' && 'Consegnato'}
                                                {order.status === 'cancelled' && 'Annullato'}
                                            </div>
                                        </div>

                                        {/* 2. BODY: DETAILS GRID */}
                                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                            
                                            {/* Column 1: Customer */}
                                            <div>
                                                <h5 className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest"><User size={12}/> Cliente</h5>
                                                <p className="font-bold text-slate-900 text-sm mb-1">{order.customerName}</p>
                                                <p className="text-slate-500 text-sm">{order.customerEmail}</p>
                                            </div>

                                            {/* Column 2: Shipping */}
                                            <div>
                                                <h5 className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest"><MapPin size={12}/> Spedizione</h5>
                                                <p className="text-slate-600 text-sm leading-relaxed max-w-xs">{order.shippingAddress}</p>
                                            </div>

                                            {/* Column 3: Total */}
                                            <div className="md:text-right">
                                                <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">Totale Ordine</h5>
                                                <p className="font-oswald font-bold text-2xl text-[#0066b2]">€{order.total.toFixed(2)}</p>
                                                <p className="text-xs text-slate-400 mt-1">{order.items.length} Articoli</p>
                                            </div>
                                        </div>

                                        {/* 3. ITEMS LIST (Compact) */}
                                        <div className="px-6 md:px-8 pb-6">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-slate-400 font-mono text-xs">{item.quantity}x</span>
                                                            <span className="text-slate-700 font-medium">{item.title}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">{item.selectedSize}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 4. FOOTER: ACTIONS & STATUS SELECTOR */}
                                        <div className="bg-slate-50/50 p-6 md:p-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                            
                                            {/* Left: Quick Actions */}
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                {order.invoiceDetails && (
                                                    <button onClick={() => showToast('Generazione fattura non ancora disponibile')} className={invoiceBtnClass} title="Genera Fattura">
                                                        <FileText size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteOrder(order.id)} className={deleteBtnClass} title="Elimina Ordine">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* Right: Modern Status Selector (No Labels, Clean Pill) */}
                                            <div className="relative group w-full md:w-auto">
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} 
                                                    className="appearance-none w-full md:w-48 bg-white border border-slate-200 hover:border-[#0066b2] rounded-full py-3 pl-5 pr-12 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm text-slate-700"
                                                >
                                                    <option value="paid">Pagato</option>
                                                    <option value="shipped">Spedito</option>
                                                    <option value="delivered">Consegnato</option>
                                                    <option value="cancelled">Annullato</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#0066b2] transition-colors" size={16} />
                                            </div>

                                        </div>
                                    </div>
                                ))}

                                {/* PAGINATION CONTROLS */}
                                {orders.length > ORDERS_PER_PAGE && (
                                    <div className="flex justify-center items-center gap-6 mt-10 pt-6 border-t border-slate-100">
                                        <button 
                                            disabled={currentOrderPage === 1}
                                            onClick={() => setCurrentOrderPage(p => p - 1)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 font-bold uppercase text-xs hover:border-[#0066b2] hover:text-[#0066b2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                        >
                                            <ChevronLeft size={16} /> Precedente
                                        </button>
                                        
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Pagina <span className="text-slate-900 text-sm">{currentOrderPage}</span> di {totalOrderPages}
                                        </span>

                                        <button 
                                            disabled={currentOrderPage === totalOrderPages}
                                            onClick={() => setCurrentOrderPage(p => p + 1)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 font-bold uppercase text-xs hover:border-[#0066b2] hover:text-[#0066b2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                        >
                                            Successivo <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        )}

        {/* --- SHIPPING TAB --- */}
        {activeTab === 'shipping' && (
             <div className="max-w-2xl mx-auto">
                 <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><Plane size={32} /></div>
                        <div><h3 className={headerTitleClass}>Spedizioni</h3><p className={headerSubtitleClass}>Configura tariffe e soglie.</p></div>
                    </div>
                    <form onSubmit={handleShippingSubmit} className="space-y-8">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><img src="https://flagcdn.com/w20/it.png" alt="IT" className="rounded-sm shadow-sm"/> Italia</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Costo (€)</label><input type="number" className={inputClass} value={shippingForm.italyPrice} onChange={e => setShippingForm({...shippingForm, italyPrice: parseFloat(e.target.value)})} /></div>
                                <div><label className={labelClass}>Gratis da (€)</label><input type="number" className={inputClass} value={shippingForm.italyThreshold} onChange={e => setShippingForm({...shippingForm, italyThreshold: parseFloat(e.target.value)})} /></div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe size={18} className="text-slate-400"/> Estero</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Costo (€)</label><input type="number" className={inputClass} value={shippingForm.foreignPrice} onChange={e => setShippingForm({...shippingForm, foreignPrice: parseFloat(e.target.value)})} /></div>
                                <div><label className={labelClass}>Gratis da (€)</label><input type="number" className={inputClass} value={shippingForm.foreignThreshold} onChange={e => setShippingForm({...shippingForm, foreignThreshold: parseFloat(e.target.value)})} /></div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-4">
                            <button type="submit" className={actionButtonClass}>
                                <ActionButtonContent icon={Save} text="Salva Regole" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- PAYMENTS TAB --- */}
        {activeTab === 'payments' && (
            <div className="max-w-2xl mx-auto">
                <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><CreditCard size={32} /></div>
                        <div><h3 className={headerTitleClass}>Stripe</h3><p className={headerSubtitleClass}>Configurazione gateway pagamenti.</p></div>
                    </div>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        <div className="flex items-center gap-3 bg-blue-50 p-6 rounded-2xl text-sm text-[#0066b2] mb-6"><CreditCard size={24} /><p className="font-medium">Chiavi API per processare pagamenti sicuri.</p></div>
                        <div><label className={labelClass}>Public Key</label><input type="text" className={inputClass} value={paymentForm.publicKey} onChange={e => setPaymentForm({...paymentForm, publicKey: e.target.value})} placeholder="pk_test_..." /></div>
                        <div><label className={labelClass}>Secret Key</label><input type="password" className={inputClass} value={paymentForm.secretKey} onChange={e => setPaymentForm({...paymentForm, secretKey: e.target.value})} placeholder="sk_test_..." /></div>
                        <div><label className={labelClass}>Webhook Secret</label><input type="password" className={inputClass} value={paymentForm.webhookSecret} onChange={e => setPaymentForm({...paymentForm, webhookSecret: e.target.value})} placeholder="whsec_..." /></div>
                        <div>
                            <label className={labelClass}>Modalità</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setPaymentForm({...paymentForm, isEnabled: false})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${!paymentForm.isEnabled ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Test</button>
                                <button type="button" onClick={() => setPaymentForm({...paymentForm, isEnabled: true})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${paymentForm.isEnabled ? 'bg-[#0066b2] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Live</button>
                            </div>
                        </div>
                         <div className="flex justify-center pt-4">
                            <button type="submit" className={actionButtonClass}>
                                <ActionButtonContent icon={Save} text="Salva Configurazione" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- SUPPORT TAB --- */}
        {activeTab === 'support' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* WhatsApp Config */}
                 <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><MessageCircle size={32} /></div>
                        <div><h3 className={headerTitleClass}>WhatsApp</h3><p className={headerSubtitleClass}>Numero business.</p></div>
                    </div>
                    <form onSubmit={handleSupportSubmit} className="space-y-6">
                        <div>
                            <label className={labelClass}>Numero (con prefisso)</label>
                            <input type="text" className={inputClass} value={whatsappNum} onChange={e => setWhatsappNum(e.target.value)} placeholder="393331234567" />
                        </div>
                        <div className="flex justify-center pt-4">
                             <button type="submit" className={actionButtonClass}>
                                 <ActionButtonContent icon={Save} text="Salva" />
                             </button>
                        </div>
                    </form>
                 </div>

                 {/* Mail Config */}
                 <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><Mail size={32} /></div>
                        <div><h3 className={headerTitleClass}>EmailJS</h3><p className={headerSubtitleClass}>Configurazione modulo contatto.</p></div>
                    </div>
                    <form onSubmit={handleMailSubmit} className="space-y-6">
                        <div><label className={labelClass}>Email Ricezione</label><input type="email" className={inputClass} value={mailForm.emailTo} onChange={e => setMailForm({...mailForm, emailTo: e.target.value})} placeholder="info@tacalabala.it" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Service ID</label><input type="text" className={inputClass} value={mailForm.serviceId} onChange={e => setMailForm({...mailForm, serviceId: e.target.value})} /></div>
                            <div><label className={labelClass}>Template ID</label><input type="text" className={inputClass} value={mailForm.templateId} onChange={e => setMailForm({...mailForm, templateId: e.target.value})} /></div>
                        </div>
                        <div><label className={labelClass}>Public Key</label><input type="password" className={inputClass} value={mailForm.publicKey} onChange={e => setMailForm({...mailForm, publicKey: e.target.value})} /></div>
                        <div className="flex justify-center pt-4">
                            <button type="submit" className={actionButtonClass}>
                                <ActionButtonContent icon={Save} text="Salva" />
                            </button>
                        </div>
                    </form>
                 </div>
            </div>
        )}

        {/* --- FAQ TAB --- */}
        {activeTab === 'faq' && (
             <div className="max-w-4xl mx-auto">
                 <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><HelpCircle size={32} /></div>
                        <div><h3 className={headerTitleClass}>Gestione FAQ</h3><p className={headerSubtitleClass}>Domande frequenti sito.</p></div>
                    </div>

                    <div className="mb-12 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                        <h4 className={sectionHeaderClass}><Plus size={16}/> Aggiungi Domanda</h4>
                        <div className="space-y-6">
                            <div><label className={labelClass}>Domanda</label><input type="text" className={`${inputClass} bg-white`} value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} /></div>
                            <div><label className={labelClass}>Risposta</label><textarea rows={3} className={`${inputClass} bg-white`} value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} /></div>
                            <div className="flex justify-center">
                                <button onClick={handleAddFaq} className={actionButtonClass}>
                                    <ActionButtonContent icon={Plus} text="Aggiungi" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className={labelClass}>Lista Domande</label>
                        {supportConfig.faqs.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">Nessuna FAQ presente.</div>
                        ) : (
                            supportConfig.faqs.map(faq => (
                                <div key={faq.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex justify-between items-start hover:shadow-lg transition-all group">
                                    <div className="pr-8">
                                        <h4 className="font-bold text-lg text-slate-900 mb-2">{faq.question}</h4>
                                        <p className="text-slate-500 leading-relaxed text-sm">{faq.answer}</p>
                                    </div>
                                    <button onClick={() => handleDeleteFaq(faq.id)} className={deleteBtnClass}><Trash2 size={18} /></button>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
             </div>
        )}

        {/* --- PROMOTIONS TAB --- */}
        {activeTab === 'promotions' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><Tag size={32} /></div>
                        <div><h3 className={headerTitleClass}>Nuova Promo</h3><p className={headerSubtitleClass}>Crea codice sconto.</p></div>
                    </div>
                    <form onSubmit={handleDiscountSubmit} className="space-y-6">
                        <div><label className={labelClass}>Nome</label><input type="text" className={inputClass} value={newDiscount.name} onChange={e => setNewDiscount({...newDiscount, name: e.target.value})} placeholder="BLACK FRIDAY" required /></div>
                        <div><label className={labelClass}>Sconto (%)</label><input type="number" className={inputClass} value={newDiscount.percentage} onChange={e => setNewDiscount({...newDiscount, percentage: Number(e.target.value)})} placeholder="20" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Inizio</label><input type="date" className={inputClass} value={discountDates.start} onChange={e => setDiscountDates({...discountDates, start: e.target.value})} required /></div>
                            <div><label className={labelClass}>Fine</label><input type="date" className={inputClass} value={discountDates.end} onChange={e => setDiscountDates({...discountDates, end: e.target.value})} required /></div>
                        </div>
                        <div>
                            <label className={labelClass}>Target</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setNewDiscount({...newDiscount, targetType: 'all'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${newDiscount.targetType === 'all' ? 'bg-white text-[#0066b2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Tutto</button>
                                <button type="button" onClick={() => setNewDiscount({...newDiscount, targetType: 'specific'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${newDiscount.targetType === 'specific' ? 'bg-white text-[#0066b2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Specifico</button>
                            </div>
                            {newDiscount.targetType === 'specific' && (
                                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 mt-4">
                                    {products.map(p => (
                                        <div key={p.id} onClick={() => toggleProductInDiscount(p.id)} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newDiscount.targetProductIds?.includes(p.id) ? 'bg-[#0066b2] border-[#0066b2]' : 'border-slate-300'}`}>{newDiscount.targetProductIds?.includes(p.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}</div><img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" /><span className="text-sm font-bold text-slate-700">{p.title}</span></div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center pt-4">
                             <button type="submit" className={actionButtonClass}>
                                 <ActionButtonContent icon={Save} text="Salva" />
                             </button>
                        </div>
                    </form>
                </div>

                <div className={cardClass}>
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                        <div className={headerIconClass}><Calendar size={32} /></div>
                        <div><h3 className={headerTitleClass}>Attive</h3><p className={headerSubtitleClass}>Promozioni in corso.</p></div>
                    </div>
                    <div className="space-y-4">
                        {discounts.map(d => {
                            const now = new Date(); const start = new Date(d.startDate); const end = new Date(d.endDate); const isActive = now >= start && now <= end && d.isActive;
                            return (
                                <div key={d.id} className={`p-6 border rounded-3xl relative ${isActive ? 'bg-blue-50 border-[#0066b2]' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                    <div className="flex justify-between items-start">
                                        <div><h4 className="font-oswald font-bold text-xl uppercase">{d.name}</h4><div className="flex items-center gap-2 mt-1"><span className="text-2xl font-bold text-[#0066b2]">-{d.percentage}%</span><span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{d.targetType === 'all' ? 'Tutto il sito' : 'Prodotti Selezionati'}</span></div><p className="text-xs text-slate-500 mt-2 font-mono">{start.toLocaleDateString()} - {end.toLocaleDateString()}</p></div>
                                        <button onClick={() => handleDeleteDiscount(d.id)} className={deleteBtnClass}><Trash2 size={18} /></button>
                                    </div>
                                    {!isActive && <div className="absolute top-4 right-14 text-[10px] font-bold uppercase text-slate-400 bg-slate-200 px-2 py-1 rounded">{now > end ? 'Scaduta' : 'Programmata'}</div>}
                                </div>
                            );
                        })}
                        {discounts.length === 0 && <p className="text-center text-slate-400 italic py-10">Nessuna promozione attiva.</p>}
                    </div>
                </div>
             </div>
        )}

      </div>
    </section>
  );
};

export default Admin;
