
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant, Size, FAQ, Discount, OrderStatus, ShippingConfig } from '../types';
import { Plus, Trash2, LogOut, Package, CreditCard, Save, MessageCircle, Tag, Calendar, ShoppingBag, Truck, Check, Search, Shirt, Layers, Image as ImageIcon, Upload, Settings, Mail, Shield, AlertTriangle, ChevronDown, X, Phone, Globe, ToggleLeft, ToggleRight, HelpCircle, AlertOctagon, List, Edit3, PackageOpen, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sendShippingConfirmationEmail } from '../utils/emailSender';
import { motion, AnimatePresence } from 'framer-motion';

// --- TOAST SYSTEM ---
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const ToastNotification = ({ toast, remove }: { toast: Toast; remove: (id: number) => void; key?: string | number }) => {
    useEffect(() => {
        const timer = setTimeout(() => remove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, remove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
                flex items-center gap-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[300px] pointer-events-auto
                ${toast.type === 'success' 
                    ? 'bg-white/90 border-green-500/20 text-slate-800' 
                    : 'bg-white/90 border-red-500/20 text-slate-800'
                }
            `}
        >
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0
                ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
            `}>
                {toast.type === 'success' ? <Check size={20} strokeWidth={3} /> : <XCircle size={20} strokeWidth={3} />}
            </div>
            <div className="flex-1">
                <h4 className={`font-oswald uppercase font-bold text-sm ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {toast.type === 'success' ? 'Operazione Riuscita' : 'Errore'}
                </h4>
                <p className="text-xs font-medium text-slate-500">{toast.message}</p>
            </div>
            <button onClick={() => remove(toast.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};

// --- UI COMPONENTS ---

const LiquidButton = ({ 
    onClick, 
    label, 
    icon: Icon, 
    variant = 'primary', 
    type = 'button',
    disabled = false,
    className = ''
}: { 
    onClick?: () => void, 
    label: string, 
    icon?: any, 
    variant?: 'primary' | 'outline' | 'danger' | 'success', 
    type?: 'button' | 'submit',
    disabled?: boolean,
    className?: string
}) => {
    const baseClass = "relative overflow-hidden group/btn py-3 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2 transform-gpu active:scale-95 border shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-white border-[#0066b2] text-[#0066b2] hover:text-white",
        outline: "bg-white border-slate-200 text-slate-500 hover:text-[#0066b2] hover:border-[#0066b2]",
        danger: "bg-white border-red-500 text-red-500 hover:text-white",
        success: "bg-white border-green-600 text-green-600 hover:text-white"
    };

    const fills = {
        primary: "bg-[#0066b2]",
        outline: "bg-blue-50",
        danger: "bg-red-500",
        success: "bg-green-600"
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]} ${className}`}>
            {variant !== 'outline' && (
                <span className={`absolute inset-0 ${fills[variant]} translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0`}></span>
            )}
            <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon size={16} />} {label}
            </span>
        </button>
    );
};

const SegmentedControl = ({ 
    options, 
    value, 
    onChange,
    className = ''
}: { 
    options: { value: string, label: string }[], 
    value: string, 
    onChange: (val: any) => void,
    className?: string
}) => {
    return (
        <div className={`bg-slate-100 p-1.5 rounded-2xl flex relative w-full ${className}`}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 relative z-10 ${value === opt.value ? 'text-[#0066b2] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {value === opt.value && (
                        <motion.div 
                            layoutId={`segment-${options[0].value}`}
                            className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

const InputGroup = ({ label, children, className = '', helpText }: { label: string, children: React.ReactNode, className?: string, helpText?: string }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{label}</label>
        {children}
        {helpText && <p className="text-[10px] text-slate-400 pl-1 font-medium">{helpText}</p>}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-sm font-medium placeholder:text-slate-300 disabled:opacity-50 focus:shadow-sm focus:bg-white ${props.className}`} />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select {...props} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-10 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-sm font-bold cursor-pointer focus:bg-white" />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
);

const Card = ({ title, subtitle, icon: Icon, children, className = '' }: { title?: string, subtitle?: string, icon?: any, children: React.ReactNode, className?: string }) => (
    <div className={`bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden h-full flex flex-col ${className}`}>
        {(title || Icon) && (
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-50 flex-shrink-0">
                {Icon && (
                    <div className="w-12 h-12 bg-[#0066b2] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Icon size={24} />
                    </div>
                )}
                <div>
                    <h3 className="font-oswald text-2xl uppercase font-bold text-slate-900 leading-none">{title}</h3>
                    {subtitle && <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mt-1">{subtitle}</p>}
                </div>
            </div>
        )}
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const sortSizes = (variants: {size: string, stock: number}[]) => {
    const order = ['S', 'M', 'L', 'XL'];
    return [...variants].sort((a, b) => order.indexOf(a.size) - order.indexOf(b.size));
};

const ModalOverlay = ({ children, isOpen }: { children: React.ReactNode, isOpen: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="animate-in zoom-in-95 duration-300 w-full max-w-sm">
                {children}
            </div>
        </div>
    );
};

// --- MAIN ADMIN ---

interface AdminProps { onLogout: () => void; }

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
    const { 
        products, orders, discounts,
        stripeConfig, supportConfig, mailConfig, shippingConfig,
        addProduct, deleteProduct, updateProductStock, updateProductDetails, addDiscount, deleteDiscount,
        addFaq, deleteFaq, setStripeConfig, setSupportConfig, setMailConfig, setShippingConfig,
        updateOrderStatus, deleteOrder,
    } = useStore();

    // Flattened Navigation Tabs
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'promotions' | 'shipping' | 'payments' | 'contacts' | 'faq'>('products');

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void;}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [trackingModal, setTrackingModal] = useState<{isOpen: boolean; orderId: string | null; email: string; name: string;}>({ isOpen: false, orderId: null, email: '', name: '' });
    
    // Toasts State
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    // Inventory Local Edit State
    const [editForm, setEditForm] = useState<{id: string, title: string, price: string, articleCode: string}>({ id: '', title: '', price: '', articleCode: '' });

    // Forms
    const [newProduct, setNewProduct] = useState<Partial<Product>>({ title: '', articleCode: '', brand: 'Tacalabala', kitType: '', year: '', price: '', imageUrl: '', images: [], condition: 'Nuovo con etichetta', description: '', isSoldOut: false, tags: [], instagramUrl: '', dropDate: '' });
    const [variantsState, setVariantsState] = useState<{size: Size, enabled: boolean, stock: string}[]>([ { size: 'S', enabled: true, stock: '10' }, { size: 'M', enabled: true, stock: '10' }, { size: 'L', enabled: true, stock: '10' }, { size: 'XL', enabled: true, stock: '10' } ]);
    const [uploadImages, setUploadImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [shipForm, setShipForm] = useState(shippingConfig);
    const [payForm, setPayForm] = useState(stripeConfig);
    const [mailFormState, setMailFormState] = useState(mailConfig);
    const [whatsappForm, setWhatsappForm] = useState({ prefix: '+39', number: supportConfig.whatsappNumber.replace('+39', '') });
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    const [promoType, setPromoType] = useState<'automatic' | 'coupon'>('automatic');
    const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({ name: '', code: '', percentage: 20, targetType: 'all', targetProductIds: [], isActive: true });
    const [discountDates, setDiscountDates] = useState({ start: new Date().toISOString().split('T')[0], end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });


    // --- HANDLERS ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            Array.from(files).forEach((file: File) => {
                if (file.size > 1024 * 1024) { addToast(`File ${file.name} troppo grande. Max 1MB.`, 'error'); return; }
                const reader = new FileReader();
                reader.onloadend = () => { if (typeof reader.result === 'string') newImages.push(reader.result); if (newImages.length === files.length) setUploadImages(prev => [...prev, ...newImages]); };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.articleCode) { addToast("SKU Obbligatorio", 'error'); return; }
        const finalImages = uploadImages.length > 0 ? uploadImages : [newProduct.imageUrl || 'https://via.placeholder.com/400'];
        const finalVariants: ProductVariant[] = variantsState.filter(v => v.enabled).map(v => ({ size: v.size, stock: parseInt(v.stock) || 0 }));
        const formattedPrice = `€${newProduct.price}`;

        const productToAdd: Product = {
            id: Date.now().toString(),
            articleCode: newProduct.articleCode,
            title: newProduct.title || 'Untitled',
            brand: 'Tacalabala',
            kitType: newProduct.kitType,
            year: newProduct.year,
            season: 'Classic', 
            price: formattedPrice,
            imageUrl: finalImages[0],
            images: finalImages,
            size: finalVariants.map(v => v.size).join(' - '),
            condition: newProduct.condition || 'Nuova',
            description: newProduct.description || '',
            isSoldOut: finalVariants.every(v => v.stock === 0),
            tags: newProduct.tags || [],
            instagramUrl: newProduct.instagramUrl,
            dropDate: newProduct.dropDate,
            variants: finalVariants
        };
        addProduct(productToAdd);
        setNewProduct({ title: '', articleCode: '', brand: 'Tacalabala', kitType: '', year: '', price: '', imageUrl: '', images: [], condition: 'Nuovo con etichetta', description: '', isSoldOut: false, tags: [], instagramUrl: '', dropDate: '' });
        setUploadImages([]);
        addToast('Prodotto aggiunto con successo!', 'success');
    };

    const handleTrackingConfirm = (code: string, courier: string) => {
        if (trackingModal.orderId) {
            updateOrderStatus(trackingModal.orderId, 'shipped', code, courier);
            sendShippingConfirmationEmail(mailConfig, trackingModal.orderId, trackingModal.email, trackingModal.name, code, courier);
            addToast('Ordine spedito e mail inviata!', 'success');
        }
        setTrackingModal({ isOpen: false, orderId: null, email: '', name: '' });
    };

    const handleDiscountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const endDate = new Date(discountDates.end);
        endDate.setHours(23, 59, 59, 999);
        const discount: Discount = {
            id: Date.now().toString(),
            name: newDiscount.name!,
            code: newDiscount.code,
            discountType: promoType,
            percentage: Number(newDiscount.percentage),
            startDate: new Date(discountDates.start).toISOString(),
            endDate: endDate.toISOString(),
            targetType: newDiscount.targetType as 'all' | 'specific',
            targetProductIds: newDiscount.targetProductIds || [],
            isActive: true
        };
        addDiscount(discount);
        addToast('Promozione creata!', 'success');
    };

    const handleStripeModeChange = (val: string) => {
        if (val === 'true') {
            setModalConfig({
                isOpen: true,
                title: 'Attiva Live Mode?',
                message: 'Stai per attivare i pagamenti reali. Le transazioni verranno addebitate.',
                onConfirm: () => { setPayForm({...payForm, isEnabled: true}); setModalConfig(prev => ({...prev, isOpen: false})); }
            });
        } else {
            setPayForm({...payForm, isEnabled: false});
        }
    };

    const startEditingProduct = (product: Product) => {
        setExpandedProductId(product.id === expandedProductId ? null : product.id);
        if (product.id !== expandedProductId) {
             setEditForm({
                 id: product.id,
                 title: product.title,
                 price: product.price.replace('€', '').trim(),
                 articleCode: product.articleCode
             });
        }
    };

    const handleUpdateProductDetails = () => {
        if (!editForm.id) return;
        updateProductDetails(editForm.id, {
            title: editForm.title,
            price: `€${editForm.price}`,
            articleCode: editForm.articleCode
        });
        addToast('Dettagli prodotto aggiornati', 'success');
    };

    return (
        <section className="pt-32 md:pt-48 pb-16 md:pb-24 bg-slate-50 min-h-screen relative overflow-hidden">
            
            {/* Toast Container - Fixed Bottom Right */}
            <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastNotification key={toast.id} toast={toast as Toast} remove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>

            <ModalOverlay isOpen={modalConfig.isOpen}>
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 text-center border border-slate-100 relative overflow-hidden">
                     {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm"><AlertTriangle size={32} /></div>
                    <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900 mb-2">{modalConfig.title}</h3>
                    <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">{modalConfig.message}</p>
                    <div className="flex gap-3">
                        <LiquidButton onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} label="Annulla" variant="outline" className="flex-1" />
                        <LiquidButton onClick={modalConfig.onConfirm} label="Conferma" variant="danger" className="flex-1" />
                    </div>
                </div>
            </ModalOverlay>

            <ModalOverlay isOpen={trackingModal.isOpen}>
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 text-center border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0066b2]"></div>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0066b2] shadow-sm"><Truck size={32} /></div>
                    <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900 mb-2">Conferma Spedizione</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleTrackingConfirm(formData.get('tracking') as string, formData.get('courier') as string);
                    }} className="text-left space-y-4">
                        <InputGroup label="Corriere">
                            <StyledSelect name="courier" required>
                                <option value="">Seleziona...</option><option value="DHL">DHL</option><option value="UPS">UPS</option><option value="BRT">Bartolini</option><option value="SDA">SDA/Poste</option><option value="GLS">GLS</option>
                            </StyledSelect>
                        </InputGroup>
                        <InputGroup label="Codice Tracking">
                            <StyledInput name="tracking" placeholder="Es. 1Z999..." required />
                        </InputGroup>
                        <div className="flex gap-3 pt-4">
                            <LiquidButton onClick={() => setTrackingModal({...trackingModal, isOpen: false})} label="Annulla" variant="outline" className="flex-1" />
                            <LiquidButton type="submit" label="Conferma" variant="primary" className="flex-1" />
                        </div>
                    </form>
                </div>
            </ModalOverlay>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase text-slate-900 leading-[0.9]">
                            Area <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Riservata</span>
                        </h2>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Pannello di controllo</p>
                    </div>
                    <LiquidButton onClick={onLogout} label="Logout" icon={LogOut} variant="danger" />
                </div>

                {/* --- FLUID NAVIGATION BAR (UNIFIED) --- */}
                <div className="flex p-1.5 bg-slate-200/50 rounded-full mb-12 relative max-w-full mx-auto backdrop-blur-sm border border-slate-200 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'products', label: 'Prodotti' },
                        { id: 'orders', label: 'Ordini' },
                        { id: 'promotions', label: 'Promo' },
                        { id: 'shipping', label: 'Spedizioni' },
                        { id: 'payments', label: 'Pagamenti' },
                        { id: 'contacts', label: 'Contatti' },
                        { id: 'faq', label: 'FAQ' },
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 relative py-4 px-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors duration-300 z-10 whitespace-nowrap min-w-fit ${activeTab === tab.id ? 'text-[#0066b2]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full shadow-md z-[-1]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Nuovo Articolo" subtitle="Inserisci i dettagli streetwear" icon={Plus}>
                            <form onSubmit={handleProductSubmit} className="h-full flex flex-col">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-grow items-start">
                                    
                                    {/* Column Left: Info */}
                                    <div className="space-y-6 h-full">
                                        <InputGroup label="Titolo Prodotto">
                                            <StyledInput value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="Es. Milano Concrete Tee" required />
                                        </InputGroup>
                                        
                                        {/* SKU + Prezzo (Fixed format) */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputGroup label="SKU (Codice)">
                                                <StyledInput value={newProduct.articleCode} onChange={e => setNewProduct({...newProduct, articleCode: e.target.value})} placeholder="TC-001" required />
                                            </InputGroup>
                                            <InputGroup label="Prezzo">
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 font-bold z-10">€</span>
                                                    <StyledInput 
                                                        type="number" 
                                                        value={newProduct.price} 
                                                        onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                                                        className="pl-8" 
                                                        required 
                                                        placeholder="45"
                                                    />
                                                </div>
                                            </InputGroup>
                                        </div>

                                        {/* Kit Type + Anno Row */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputGroup label="Kit Type"><StyledInput value={newProduct.kitType} onChange={e => setNewProduct({...newProduct, kitType: e.target.value})} placeholder="Home" /></InputGroup>
                                            <InputGroup label="Anno"><StyledInput value={newProduct.year} onChange={e => setNewProduct({...newProduct, year: e.target.value})} placeholder="2024" /></InputGroup>
                                        </div>

                                        <InputGroup label="Descrizione">
                                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-sm font-medium h-40 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Descrivi il fit e i dettagli..." />
                                        </InputGroup>
                                    </div>

                                    {/* Column Right: Media & Variants */}
                                    <div className="flex flex-col gap-6 h-full">
                                        
                                        {/* Image Upload Redesigned */}
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 pl-1">Galleria Immagini (Max 1MB)</span>
                                            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200 flex-grow">
                                                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                                
                                                <div className="grid grid-cols-3 gap-4">
                                                    {uploadImages.map((img, i) => (
                                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-white shadow-sm">
                                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                                            <button type="button" onClick={() => setUploadImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={24}/></button>
                                                        </div>
                                                    ))}
                                                    
                                                    {/* Clean Add Button inside grid */}
                                                    <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-[#0066b2] hover:border-[#0066b2] hover:bg-white cursor-pointer transition-all gap-2 group">
                                                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Aggiungi</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200">
                                            <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4">Gestione Stock per Taglia</span>
                                            <div className="grid grid-cols-2 gap-4">
                                                {variantsState.map((v, idx) => (
                                                    <div key={v.size} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                                                        <input type="checkbox" checked={v.enabled} onChange={(e) => {const up = [...variantsState]; up[idx].enabled = e.target.checked; setVariantsState(up);}} className="w-5 h-5 accent-[#0066b2] rounded cursor-pointer"/>
                                                        <span className="font-bold text-sm w-8">{v.size}</span>
                                                        <input type="number" disabled={!v.enabled} value={v.stock} onChange={(e) => {const up = [...variantsState]; up[idx].stock = e.target.value; setVariantsState(up);}} className="w-full text-right bg-transparent outline-none font-mono text-slate-900 border-b border-transparent focus:border-[#0066b2]" placeholder="0" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12 flex justify-center">
                                     <LiquidButton type="submit" label="Salva" icon={Save} variant="primary" className="w-full md:w-auto min-w-[200px]" />
                                </div>
                            </form>
                        </Card>

                        <Card title="Inventario" subtitle="Gestisci disponibilità e prezzi" icon={Layers}>
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="text" placeholder="Cerca per titolo o SKU..." className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-[#0066b2] transition-colors" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="grid gap-4">
                                {products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.articleCode.toLowerCase().includes(searchTerm.toLowerCase())).map(product => {
                                    const isExpanded = expandedProductId === product.id;
                                    const sortedVariants = sortSizes(product.variants || []);
                                    
                                    return (
                                        <div key={product.id} className={`border rounded-[1.5rem] transition-all duration-300 overflow-hidden ${isExpanded ? 'border-[#0066b2] bg-white shadow-lg ring-4 ring-blue-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                            <div className="p-5 flex items-center justify-between cursor-pointer group" onClick={() => startEditingProduct(product)}>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative">
                                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm uppercase group-hover:text-[#0066b2] transition-colors">{product.title}</h4>
                                                        <p className="text-[10px] font-mono text-slate-500 font-bold">{product.articleCode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="font-oswald font-bold text-lg text-slate-900">{product.price}</span>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setModalConfig({
                                                                isOpen: true,
                                                                title: 'Elimina Prodotto',
                                                                message: 'Sei sicuro di voler rimuovere questo articolo? L\'azione è irreversibile.',
                                                                onConfirm: () => { deleteProduct(product.id); setModalConfig(prev => ({...prev, isOpen: false})); addToast('Prodotto eliminato', 'success'); }
                                                            });
                                                        }} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all" 
                                                        title="Elimina Articolo"
                                                    >
                                                        <Trash2 size={16} /> 
                                                    </button>
                                                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-slate-100 bg-slate-50/50"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        
                                                        {/* General Edit Section */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">Titolo</label>
                                                                <input 
                                                                    className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-[#0066b2] transition-colors pb-1"
                                                                    value={editForm.title}
                                                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                                                />
                                                            </div>
                                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">SKU</label>
                                                                <input 
                                                                    className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-[#0066b2] transition-colors pb-1"
                                                                    value={editForm.articleCode}
                                                                    onChange={e => setEditForm({...editForm, articleCode: e.target.value})}
                                                                />
                                                            </div>
                                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-3 block w-full">Prezzo</label>
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <span className="text-sm font-bold text-slate-900">€</span>
                                                                    <input 
                                                                        type="number"
                                                                        className="w-14 text-center text-sm font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-[#0066b2] transition-colors pb-1"
                                                                        value={editForm.price}
                                                                        onChange={e => setEditForm({...editForm, price: e.target.value})}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* STOCK VARIANTS - CENTERED NUMBERS */}
                                                        <div>
                                                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-3 block">Gestione Stock</label>
                                                            <div className="grid grid-cols-4 gap-4">
                                                                {sortedVariants.map(v => (
                                                                    <div key={v.size} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative group overflow-hidden flex flex-col items-center justify-center text-center">
                                                                        <div className="absolute top-0 left-0 w-full h-1 bg-[#0066b2] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                        <span className="text-xs font-bold text-slate-400 mb-2">{v.size}</span>
                                                                        <input 
                                                                            type="number" 
                                                                            className="w-14 text-center font-oswald font-bold text-2xl text-slate-900 outline-none bg-transparent p-0 focus:text-[#0066b2] transition-colors mb-2" 
                                                                            value={v.stock} 
                                                                            onChange={(e) => updateProductStock(product.id, v.size as Size, parseInt(e.target.value)||0)} 
                                                                        />
                                                                        <span className="text-[9px] uppercase font-bold text-slate-300">Pezzi</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex justify-center pt-2">
                                                            <LiquidButton onClick={handleUpdateProductDetails} label="Salva Modifiche" icon={Save} variant="primary" className="w-auto" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- ORDERS --- */}
                {activeTab === 'orders' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                         <Card title="Gestione Ordini" subtitle="Spedizioni e Tracking" icon={Truck}>
                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
                                        <PackageOpen size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900 mb-2">Nessun Ordine</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Non ci sono ancora ordini da gestire. Appena qualcuno acquisterà, lo vedrai qui.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-[#0066b2] transition-all duration-300 group relative overflow-hidden">
                                            
                                            {/* Top Bar Status Line */}
                                            <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'paid' ? 'bg-green-500' : order.status === 'shipped' ? 'bg-[#0066b2]' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>

                                            {/* Grid Layout for Order Content */}
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                                                
                                                {/* Left: ID & Status */}
                                                <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">ID Ordine</span>
                                                        <h4 className="font-oswald font-bold text-xl text-slate-900">{order.id}</h4>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-1">Data</span>
                                                        <p className="text-xs font-bold text-slate-600">{new Date(order.date).toLocaleString('it-IT')}</p>
                                                    </div>
                                                    <div className="pt-2">
                                                        <div className="relative">
                                                            <select 
                                                                value={order.status}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'shipped' && order.status !== 'shipped') {
                                                                        setTrackingModal({isOpen: true, orderId: order.id, email: order.customerEmail, name: order.customerName || ''});
                                                                    } else {
                                                                        updateOrderStatus(order.id, e.target.value as OrderStatus);
                                                                    }
                                                                }}
                                                                className={`w-full appearance-none rounded-xl py-2 pl-3 pr-8 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer border transition-colors ${
                                                                    order.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                }`}
                                                            >
                                                                <option value="pending">In Attesa</option>
                                                                <option value="paid">Pagato</option>
                                                                <option value="shipped">Spedito</option>
                                                                <option value="delivered">Consegnato</option>
                                                                <option value="cancelled">Annullato</option>
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle: Customer Info */}
                                                <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Settings size={12}/></span>
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Dati Cliente</span>
                                                        </div>
                                                        <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{order.customerEmail}</p>
                                                        {order.invoiceDetails && (
                                                            <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-600 font-medium">
                                                                <p>CF: {order.invoiceDetails.taxId}</p>
                                                                {order.invoiceDetails.vatNumber && <p>P.IVA: {order.invoiceDetails.vatNumber}</p>}
                                                                {order.invoiceDetails.sdiCode && <p>SDI: {order.invoiceDetails.sdiCode}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Truck size={12}/></span>
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Spedizione</span>
                                                        </div>
                                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{order.shippingAddress}</p>
                                                        {order.trackingCode && (
                                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0066b2] rounded-full border border-blue-100">
                                                                <span className="text-[9px] font-bold uppercase">{order.courier}</span>
                                                                <span className="text-[10px] font-mono font-bold">{order.trackingCode}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Summary & Total */}
                                                <div className="lg:col-span-5 flex flex-col justify-between h-full">
                                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 flex-grow">
                                                        <ul className="space-y-2">
                                                            {order.items.map((item, i) => (
                                                                <li key={i} className="flex justify-between items-start text-xs border-b border-dashed border-slate-200 last:border-0 pb-2 last:pb-0">
                                                                    <div>
                                                                        <span className="font-bold text-slate-700">{item.quantity}x {item.title}</span>
                                                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                            <span className="text-[9px] text-slate-400 font-bold uppercase bg-white px-1.5 rounded border border-slate-100">{item.selectedSize}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="font-bold text-slate-900">{item.price}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                                                        <div></div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Totale Ordine</span>
                                                            <p className="font-oswald font-bold text-2xl text-[#0066b2] leading-none">€{order.total.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* --- PROMOTIONS --- */}
                {activeTab === 'promotions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Nuova Promo" subtitle="Crea coupon o sconti automatici" icon={Tag}>
                            <form onSubmit={handleDiscountSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1">Tipo Promozione</label>
                                    <SegmentedControl 
                                        options={[{value: 'automatic', label: 'Sconto Automatico'}, {value: 'coupon', label: 'Codice Coupon'}]}
                                        value={promoType}
                                        onChange={(val) => setPromoType(val)}
                                    />
                                </div>
                                
                                <InputGroup label="Nome Promozione">
                                    <StyledInput value={newDiscount.name} onChange={e => setNewDiscount({...newDiscount, name: e.target.value})} placeholder="Es. Saldi Estivi 2024" required />
                                </InputGroup>

                                {promoType === 'coupon' && (
                                    <InputGroup label="Codice Coupon">
                                        <StyledInput value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} placeholder="SUMMER20" />
                                    </InputGroup>
                                )}

                                <InputGroup label="Percentuale Sconto (%)">
                                    <StyledInput type="number" value={newDiscount.percentage} onChange={e => setNewDiscount({...newDiscount, percentage: Number(e.target.value)})} required />
                                </InputGroup>

                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Inizio"><StyledInput type="date" value={discountDates.start} onChange={e => setDiscountDates({...discountDates, start: e.target.value})} required /></InputGroup>
                                    <InputGroup label="Fine"><StyledInput type="date" value={discountDates.end} onChange={e => setDiscountDates({...discountDates, end: e.target.value})} required /></InputGroup>
                                </div>

                                <InputGroup label="Applica A">
                                    <div className="space-y-4">
                                        <SegmentedControl 
                                            options={[{value: 'all', label: 'Tutto il Catalogo'}, {value: 'specific', label: 'Prodotti Specifici'}]}
                                            value={newDiscount.targetType || 'all'}
                                            onChange={(val) => setNewDiscount({...newDiscount, targetType: val})}
                                        />
                                        
                                        {newDiscount.targetType === 'specific' && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-40 overflow-y-auto custom-scrollbar">
                                                {products.map(p => (
                                                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 accent-[#0066b2] rounded"
                                                            checked={newDiscount.targetProductIds?.includes(p.id)}
                                                            onChange={() => {
                                                                const ids = newDiscount.targetProductIds || [];
                                                                if(ids.includes(p.id)) setNewDiscount({...newDiscount, targetProductIds: ids.filter(i => i !== p.id)});
                                                                else setNewDiscount({...newDiscount, targetProductIds: [...ids, p.id]});
                                                            }}
                                                        />
                                                        <span className="text-xs font-bold text-slate-700">{p.title}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </InputGroup>
                                <div className="mt-6 flex justify-center">
                                   <LiquidButton type="submit" label="Salva" icon={Save} variant="primary" className="w-auto min-w-[160px]" />
                                </div>
                            </form>
                        </Card>

                        <Card title="Attive" subtitle="Lista promozioni correnti" icon={Calendar}>
                            {discounts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
                                        <Tag size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="font-oswald text-2xl font-bold uppercase text-slate-900 mb-2">Nessuna Promo</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Non hai ancora creato nessuna promozione. Crea la tua prima promo nel modulo qui sopra.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {discounts.map(d => (
                                        <div key={d.id} className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 flex justify-between items-center group hover:border-[#0066b2] transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${d.discountType === 'coupon' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {d.discountType}
                                                    </span>
                                                    {d.code && <span className="bg-[#0066b2] text-white px-2 py-1 rounded text-[10px] font-mono font-bold">{d.code}</span>}
                                                </div>
                                                <h4 className="font-oswald font-bold text-xl text-slate-900 uppercase">{d.name}</h4>
                                                <p className="text-xs font-bold text-slate-400 mt-1">Sconto {d.percentage}% • Scade: {new Date(d.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => { deleteDiscount(d.id); addToast('Promo eliminata', 'success'); }} className="w-10 h-10 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* --- SETTINGS: SHIPPING --- */}
                {activeTab === 'shipping' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Configurazione Spedizioni" icon={Truck}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-oswald text-lg uppercase font-bold text-slate-900 border-b border-slate-100 pb-2">Italia</h4>
                                    <InputGroup label="Costo Spedizione Standard (€)">
                                        <StyledInput type="number" value={shipForm.italyPrice} onChange={e => setShipForm({...shipForm, italyPrice: Number(e.target.value)})} />
                                    </InputGroup>
                                    <InputGroup label="Soglia Spedizione Gratuita (€)">
                                        <StyledInput type="number" value={shipForm.italyThreshold} onChange={e => setShipForm({...shipForm, italyThreshold: Number(e.target.value)})} />
                                    </InputGroup>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-oswald text-lg uppercase font-bold text-slate-900 border-b border-slate-100 pb-2">Estero (EU/World)</h4>
                                    <InputGroup label="Costo Spedizione (€)">
                                        <StyledInput type="number" value={shipForm.foreignPrice} onChange={e => setShipForm({...shipForm, foreignPrice: Number(e.target.value)})} />
                                    </InputGroup>
                                    <InputGroup label="Soglia Spedizione Gratuita (€)">
                                        <StyledInput type="number" value={shipForm.foreignThreshold} onChange={e => setShipForm({...shipForm, foreignThreshold: Number(e.target.value)})} />
                                    </InputGroup>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
                                <LiquidButton onClick={() => { setShippingConfig(shipForm); addToast('Spedizioni salvate', 'success'); }} label="Salva Configurazioni" icon={Save} variant="primary" className="w-full md:w-auto" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- SETTINGS: PAYMENTS --- */}
                {activeTab === 'payments' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Configurazione Stripe" subtitle="Gestisci chiavi API" icon={CreditCard}>
                            <div className="space-y-6 max-w-2xl mx-auto">
                                
                                {/* MODE INDICATOR */}
                                <div className={`p-4 rounded-xl border flex items-center gap-4 ${payForm.isEnabled ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200'}`}>
                                    <div className={`w-3 h-3 rounded-full ${payForm.isEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                    <div className="flex-1">
                                        <p className="font-bold uppercase text-xs tracking-widest text-slate-900">
                                            {payForm.isEnabled ? 'LIVE MODE ACTIVE' : 'TEST MODE ACTIVE'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {payForm.isEnabled ? 'Le transazioni sono reali e verranno addebitate.' : 'Nessun addebito reale. Usa le carte di test Stripe.'}
                                        </p>
                                    </div>
                                    <AlertOctagon size={20} className={payForm.isEnabled ? 'text-green-500' : 'text-slate-400'} />
                                </div>

                                <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <span className="text-xs font-bold uppercase text-[#0066b2] flex items-center gap-2"><Globe size={16} /> Seleziona Ambiente</span>
                                    <div className="w-full md:w-48">
                                        <SegmentedControl 
                                            options={[{value: 'false', label: 'Test Mode'}, {value: 'true', label: 'Live Mode'}]}
                                            value={String(payForm.isEnabled)}
                                            onChange={handleStripeModeChange}
                                            className="bg-white/50"
                                        />
                                    </div>
                                </div>
                                
                                <InputGroup label="Stripe Public Key">
                                    <StyledInput type="password" value={payForm.publicKey} onChange={e => setPayForm({...payForm, publicKey: e.target.value})} placeholder={payForm.isEnabled ? "pk_live_..." : "pk_test_..."} />
                                </InputGroup>
                                <InputGroup label="Stripe Secret Key">
                                    <StyledInput type="password" value={payForm.secretKey} onChange={e => setPayForm({...payForm, secretKey: e.target.value})} placeholder={payForm.isEnabled ? "sk_live_..." : "sk_test_..."} />
                                </InputGroup>
                                <InputGroup label="Webhook Secret">
                                    <StyledInput type="password" value={payForm.webhookSecret} onChange={e => setPayForm({...payForm, webhookSecret: e.target.value})} placeholder="whsec_..." />
                                </InputGroup>
                                <div className="pt-6 flex justify-center">
                                   <LiquidButton onClick={() => { setStripeConfig(payForm); addToast('Stripe configurato', 'success'); }} label="Salva Chiavi API" icon={Shield} variant="primary" className="w-full md:w-auto" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- SETTINGS: CONTACTS --- */}
                {activeTab === 'contacts' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Canali di Contatto" subtitle="Configurazione EmailJS & WhatsApp" icon={Mail}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="font-oswald text-lg uppercase font-bold text-slate-900 flex items-center gap-2"><Mail size={18}/> Email</h4>
                                    <InputGroup label="Service ID" helpText="Dalla dashboard EmailJS -> Email Services"><StyledInput value={mailFormState.serviceId} onChange={e => setMailFormState({...mailFormState, serviceId: e.target.value})} placeholder="service_z38abc..." /></InputGroup>
                                    <InputGroup label="Template ID" helpText="Dalla dashboard EmailJS -> Email Templates"><StyledInput value={mailFormState.templateId} onChange={e => setMailFormState({...mailFormState, templateId: e.target.value})} placeholder="template_7a2xyz..." /></InputGroup>
                                    <InputGroup label="Public Key" helpText="Dalla dashboard EmailJS -> Account -> Public Key"><StyledInput value={mailFormState.publicKey} onChange={e => setMailFormState({...mailFormState, publicKey: e.target.value})} placeholder="XyZ_123abc456..." /></InputGroup>
                                    <InputGroup label="Email Admin"><StyledInput value={mailFormState.emailTo} onChange={e => setMailFormState({...mailFormState, emailTo: e.target.value})} placeholder="admin@tacalabala.it" /></InputGroup>
                                    <div className="pt-4 flex justify-center">
                                        <LiquidButton onClick={() => { setMailConfig(mailFormState); addToast('EmailJS salvato', 'success'); }} label="Salva Mail" icon={Save} variant="primary" />
                                    </div>
                                </div>
                                
                                <div className="space-y-6 border-l border-slate-100 pl-8">
                                    <h4 className="font-oswald text-lg uppercase font-bold text-slate-900 flex items-center gap-2"><Phone size={18}/> WhatsApp</h4>                                    
                                    <div className="flex gap-4">
                                        <div className="w-24">
                                            <InputGroup label="Prefisso">
                                                 <StyledInput value={whatsappForm.prefix} onChange={e => setWhatsappForm({...whatsappForm, prefix: e.target.value})} placeholder="+39" />
                                            </InputGroup>
                                        </div>
                                        <div className="flex-1">
                                            <InputGroup label="Numero">
                                                 <StyledInput value={whatsappForm.number} onChange={e => setWhatsappForm({...whatsappForm, number: e.target.value})} placeholder="333 0000000" />
                                            </InputGroup>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-center">
                                        <LiquidButton onClick={() => { setSupportConfig({ whatsappNumber: `${whatsappForm.prefix}${whatsappForm.number}` }); addToast('WhatsApp aggiornato', 'success'); }} label="Salva Numero" icon={Save} variant="primary" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- SETTINGS: FAQ --- */}
                {activeTab === 'faq' && (
                    <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4">
                        <Card title="Aggiungi FAQ" icon={HelpCircle}>
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <InputGroup label="Domanda"><StyledInput value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} /></InputGroup>
                                <InputGroup label="Risposta">
                                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-[#0066b2] outline-none transition-colors text-sm font-medium h-32 resize-none" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} />
                                </InputGroup>
                                <div className="flex justify-center pt-4">
                                    <LiquidButton onClick={() => { addFaq({ ...newFaq, id: '' }); setNewFaq({question:'', answer:''}); addToast('FAQ Aggiunta', 'success'); }} label="Salva FAQ" icon={Plus} variant="primary" />
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Lista FAQ" icon={List}>
                            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {supportConfig.faqs.map(f => (
                                    <div key={f.id} className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 flex justify-between items-start group hover:border-[#0066b2] transition-colors">
                                        <div className="flex gap-4">
                                             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0066b2] shadow-sm flex-shrink-0">
                                                <HelpCircle size={20} />
                                             </div>
                                             <div>
                                                 <h4 className="font-bold text-slate-900 text-sm mb-1">{f.question}</h4>
                                                 <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.answer}</p>
                                             </div>
                                        </div>
                                        <button onClick={() => deleteFaq(f.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Admin;
