
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem, Size, Order, StripeConfig, SupportConfig, FAQ, Discount, OrderStatus, ShippingConfig } from '../types';
import { PRODUCTS } from '../constants'; 

export interface MailConfig {
    serviceId: string;
    templateId: string;
    publicKey: string;
    emailTo: string;
}

interface StoreState {
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, size: Size, newStock: number) => void;

  // Discounts
  discounts: Discount[];
  appliedCoupon: Discount | null;
  addDiscount: (discount: Discount) => void;
  deleteDiscount: (id: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  calculatePrice: (product: Product) => { finalPrice: number, originalPrice: number, hasDiscount: boolean, discountPercent: number };

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  addToCart: (product: Product, size: Size) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartDiscountAmount: () => number;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => Promise<Order | null>; 
  updateOrderStatus: (id: string, status: OrderStatus, trackingCode?: string, courier?: string) => void;
  deleteOrder: (id: string) => void;
  
  // Settings
  stripeConfig: StripeConfig;
  setStripeConfig: (config: StripeConfig) => void;
  
  shippingConfig: ShippingConfig;
  setShippingConfig: (config: ShippingConfig) => void;
  
  supportConfig: SupportConfig;
  setSupportConfig: (config: Partial<SupportConfig>) => void;
  addFaq: (faq: FAQ) => void;
  deleteFaq: (id: string) => void;

  mailConfig: MailConfig;
  setMailConfig: (config: MailConfig) => void;

  // Auth
  login: (u: string, p: string) => Promise<boolean>;

  // Initialization
  isLoading: boolean;
  initialize: () => Promise<void>;
}

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return parseFloat(priceStr.replace('€', '').replace(',', '.').trim()) || 0;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [], 
      orders: [], 
      cart: [],
      discounts: [], 
      appliedCoupon: null,
      isCartOpen: false,
      isLoading: true,
      
      stripeConfig: { publicKey: '', secretKey: '', webhookSecret: '', isEnabled: false },
      
      shippingConfig: {
          italyPrice: 10,
          italyThreshold: 100, 
          foreignPrice: 25,
          foreignThreshold: 200
      },

      supportConfig: {
          whatsappNumber: '393330000000', 
          faqs: []
      },

      mailConfig: { serviceId: '', templateId: '', publicKey: '', emailTo: '' },

      initialize: async () => {
          try {
              const res = await fetch('/api/init', { cache: 'no-store' });
              if (!res.ok) throw new Error(`API returned status ${res.status}`);
              const data = await res.json();
              
              set({
                  products: data.products || [],
                  shippingConfig: data.shippingConfig || get().shippingConfig,
                  stripeConfig: data.stripeConfig || get().stripeConfig,
                  mailConfig: data.mailConfig || get().mailConfig,
                  supportConfig: { ...get().supportConfig, ...data.supportConfig },
                  discounts: data.discounts || [],
                  isLoading: false
              });

              fetch('/api/orders').then(r => r.json()).then(orders => {
                  if(Array.isArray(orders)) set({ orders });
              }).catch(console.error);

          } catch (e) {
              console.warn("API Unavailable. Loading Fallback.", e);
              set({ products: PRODUCTS, isLoading: false });
          }
      },

      setProducts: (products) => set({ products }),
      
      addProduct: async (product) => {
          try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const data = await res.json();
            if (data.success && data.product) {
                set((state) => ({ products: [data.product, ...state.products] }));
            }
          } catch(e) { console.warn("API write failed", e); }
      },

      deleteProduct: async (id) => {
          set((state) => ({ products: state.products.filter(p => p.id !== id) }));
          try { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); } catch(e) {}
      },
      
      updateProductStock: async (productId, size, newStock) => {
          set((state) => {
              const updatedProducts = state.products.map(p => {
                  if (p.id !== productId) return p;
                  const updatedVariants = p.variants?.map(v => v.size === size ? { ...v, stock: newStock } : v) || [];
                  const isSoldOut = updatedVariants.every(v => v.stock === 0);
                  return { ...p, variants: updatedVariants, isSoldOut };
              });
              return { products: updatedProducts };
          });
          
          try {
            await fetch('/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, size, stock: newStock })
            });
          } catch(e) { console.warn("API update failed", e); }
      },

      addDiscount: async (discount) => {
          try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'discount_add', data: discount })
            });
            const data = await res.json();
            if(data.success && data.id) {
                set((state) => ({ discounts: [...state.discounts, { ...discount, id: data.id }] }));
            }
          } catch(e) { console.warn("API failed", e); }
      },

      deleteDiscount: async (id) => {
          set((state) => ({ discounts: state.discounts.filter(d => d.id !== id) }));
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'discount_delete', data: { id } })
            });
          } catch(e) {}
      },

      applyCoupon: (code) => {
          const { discounts } = get();
          const now = new Date();
          const coupon = discounts.find(d => 
              d.discountType === 'coupon' && 
              d.code?.toUpperCase() === code.toUpperCase() &&
              d.isActive &&
              new Date(d.startDate) <= now &&
              new Date(d.endDate) >= now
          );

          if (coupon) {
              set({ appliedCoupon: coupon });
              return true;
          }
          return false;
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      calculatePrice: (product: Product) => {
          const { discounts } = get();
          const originalPrice = parsePrice(product.price);
          const now = new Date();

          if (product.dropDate && new Date(product.dropDate) > now) {
             return { finalPrice: originalPrice, originalPrice: originalPrice, hasDiscount: false, discountPercent: 0 };
          }

          // Solo Promo Automatiche qui
          const applicablePromos = discounts.filter(d => {
              if (d.discountType !== 'automatic' || !d.isActive) return false;
              const start = new Date(d.startDate);
              const end = new Date(d.endDate);
              if (now < start || now > end) return false;
              if (d.targetType === 'all') return true;
              if (d.targetType === 'specific' && d.targetProductIds?.includes(product.id)) return true;
              return false;
          });

          if (applicablePromos.length > 0) {
              const bestPromo = applicablePromos.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
              const discountAmount = (originalPrice * bestPromo.percentage) / 100;
              return { finalPrice: originalPrice - discountAmount, originalPrice: originalPrice, hasDiscount: true, discountPercent: bestPromo.percentage };
          }
          return { finalPrice: originalPrice, originalPrice: originalPrice, hasDiscount: false, discountPercent: 0 };
      },

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      addToCart: (product, size) => {
        const cartId = `${product.id}-${size}`;
        const currentCart = get().cart;
        const existingItem = currentCart.find(i => i.cartId === cartId);
        
        if(product.dropDate && new Date(product.dropDate) > new Date()) return;

        let limit = 0;
        if (product.variants) {
            const variant = product.variants.find(v => v.size === size);
            limit = variant ? variant.stock : 0;
        } else { limit = 99; }

        const currentQty = existingItem ? existingItem.quantity : 0;
        if (currentQty >= limit) { alert(`Stock esaurito per la taglia ${size}.`); return; }

        if (existingItem) {
          set({ cart: currentCart.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i), isCartOpen: true });
        } else {
          set({ cart: [...currentCart, { ...product, cartId, selectedSize: size, quantity: 1 }], isCartOpen: true });
        }
      },
      removeFromCart: (cartId) => set((state) => ({ cart: state.cart.filter(i => i.cartId !== cartId) })),
      updateQuantity: (cartId, delta) => set((state) => {
        const item = state.cart.find(i => i.cartId === cartId);
        if (!item) return state;
        const newQty = item.quantity + delta;
        if (newQty < 1) return state; 
        return { cart: state.cart.map(i => i.cartId === cartId ? { ...i, quantity: newQty } : i) };
      }),
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      
      cartTotal: () => {
        const { cart, calculatePrice, appliedCoupon } = get();
        
        let subtotal = cart.reduce((acc, item) => {
          const { finalPrice } = calculatePrice(item); // Applica promo automatiche
          return acc + (finalPrice * item.quantity);
        }, 0);

        // Applica Coupon se presente
        if (appliedCoupon) {
            let discountAmount = 0;
            if (appliedCoupon.targetType === 'all') {
                discountAmount = (subtotal * appliedCoupon.percentage) / 100;
            } else {
                // Sconto solo su prodotti specifici
                cart.forEach(item => {
                    if (appliedCoupon.targetProductIds?.includes(item.id)) {
                        const { finalPrice } = calculatePrice(item);
                        discountAmount += (finalPrice * item.quantity * appliedCoupon.percentage) / 100;
                    }
                });
            }
            subtotal = Math.max(0, subtotal - discountAmount);
        }

        return subtotal;
      },

      cartDiscountAmount: () => {
          const { cart, calculatePrice, appliedCoupon } = get();
          if (!appliedCoupon) return 0;
          
          let discountAmount = 0;
          if (appliedCoupon.targetType === 'all') {
               const subtotal = cart.reduce((acc, item) => acc + (calculatePrice(item).finalPrice * item.quantity), 0);
               discountAmount = (subtotal * appliedCoupon.percentage) / 100;
          } else {
               cart.forEach(item => {
                   if (appliedCoupon.targetProductIds?.includes(item.id)) {
                       const { finalPrice } = calculatePrice(item);
                       discountAmount += (finalPrice * item.quantity * appliedCoupon.percentage) / 100;
                   }
               });
          }
          return discountAmount;
      },

      addOrder: async (order) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Errore nella creazione ordine');

            if (data.success && data.id) {
                const serverOrder = { ...order, id: data.id, total: data.total || order.total };
                set((state) => ({ orders: [serverOrder, ...state.orders] }));
                await get().initialize(); 
                return serverOrder;
            }
            return null;
        } catch (e: any) {
            console.error('Failed to sync order', e);
            throw e;
        }
      },

      updateOrderStatus: async (id, status, trackingCode, courier) => {
          set((state) => ({ 
              orders: state.orders.map(o => o.id === id ? { ...o, status, trackingCode, courier } : o) 
          }));
          try {
            await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, trackingCode, courier })
            });
          } catch(e) { console.warn("API failed", e); }
      },

      deleteOrder: async (id) => {
          set((state) => ({ orders: state.orders.filter(o => o.id !== id) }));
          try { await fetch(`/api/orders?id=${id}`, { method: 'DELETE' }); } catch(e) {}
      },

      setStripeConfig: async (config) => {
          set({ stripeConfig: config });
          try { await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'stripe', data: config})}); } catch(e){}
      },
      
      setShippingConfig: async (config) => {
          set({ shippingConfig: config });
          try { await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'shipping', data: config})}); } catch(e){}
      },
      
      setSupportConfig: async (config) => {
          set((state) => ({ supportConfig: { ...state.supportConfig, ...config } }));
          if (config.whatsappNumber) {
            try { await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'support', data: { whatsappNumber: config.whatsappNumber }})}); } catch(e){}
          }
      },
      
      addFaq: async (faq) => {
          try {
            const res = await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'faq_add', data: faq})});
            const data = await res.json();
            if(data.success) set((state) => ({ supportConfig: { ...state.supportConfig, faqs: [...state.supportConfig.faqs, { ...faq, id: data.id }] } }));
          } catch(e){}
      },

      deleteFaq: async (id) => {
          set((state) => ({ supportConfig: { ...state.supportConfig, faqs: state.supportConfig.faqs.filter(f => f.id !== id) } }));
          try { await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'faq_delete', data: { id }})}); } catch(e){}
      },

      setMailConfig: async (config) => {
          set({ mailConfig: config });
          try { await fetch('/api/settings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'emailjs', data: config})}); } catch(e){}
      },

      login: async (username, password) => {
          try {
              const res = await fetch('/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password })
              });
              const data = await res.json();
              if (res.ok && data.success) return true;
              return false;
          } catch (e) { return false; }
      }
    }),
    { 
        name: 'tacalabala-store', 
        storage: createJSONStorage(() => localStorage), 
        partialize: (state) => ({ cart: state.cart }) 
    }
  )
);
