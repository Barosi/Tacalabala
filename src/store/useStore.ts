
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem, Size, Order, StripeConfig, SupportConfig, FAQ, Discount, OrderStatus, ShippingConfig } from '../types';
import { PRODUCTS } from '../constants'; // Fallback Data

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
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, size: Size, newStock: number) => void;

  // Discounts
  discounts: Discount[];
  addDiscount: (discount: Discount) => void;
  deleteDiscount: (id: string) => void;
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

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
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

      // --- ASYNC INITIALIZATION ---
      initialize: async () => {
          try {
              const res = await fetch('/api/init');
              if (!res.ok) {
                  throw new Error(`API returned status ${res.status}`);
              }
              const data = await res.json();
              
              set({
                  products: data.products || [],
                  shippingConfig: data.shippingConfig || get().shippingConfig,
                  stripeConfig: data.stripeConfig || get().stripeConfig,
                  mailConfig: data.mailConfig || get().mailConfig,
                  supportConfig: { 
                      ...get().supportConfig, 
                      ...data.supportConfig 
                  },
                  discounts: data.discounts || [],
                  isLoading: false
              });

              // Lazy load orders
              fetch('/api/orders').then(r => r.json()).then(orders => {
                  if(Array.isArray(orders)) set({ orders });
              }).catch(console.error);

          } catch (e) {
              console.warn("API Unavailable (likely local/preview mode). Loading Fallback Data.", e);
              // Fallback to local constants
              set({ 
                  products: PRODUCTS,
                  isLoading: false,
                  // Ensure basic configs exist so page doesn't break
                  shippingConfig: get().shippingConfig,
                  supportConfig: get().supportConfig
              });
          }
      },

      setProducts: (products) => set({ products }),
      
      addProduct: async (product) => {
          set((state) => ({ products: [product, ...state.products] }));
          try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            get().initialize();
          } catch(e) { console.warn("API write failed", e); }
      },

      deleteProduct: async (id) => {
          set((state) => ({ products: state.products.filter(p => p.id !== id) }));
          try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
          } catch(e) { console.warn("API delete failed", e); }
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
          set((state) => ({ discounts: [...state.discounts, discount] }));
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'discount_add', data: discount })
            });
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
          } catch(e) { console.warn("API failed", e); }
      },

      calculatePrice: (product: Product) => {
          const { discounts } = get();
          const originalPrice = parsePrice(product.price);
          const now = new Date();

          if (product.dropDate && new Date(product.dropDate) > now) {
             return { finalPrice: originalPrice, originalPrice: originalPrice, hasDiscount: false, discountPercent: 0 };
          }

          const applicableDiscounts = discounts.filter(d => {
              const start = new Date(d.startDate);
              const end = new Date(d.endDate);
              const isActiveTime = now >= start && now <= end;
              if (!isActiveTime || !d.isActive) return false;
              if (d.targetType === 'all') return true;
              if (d.targetType === 'specific' && d.targetProductIds?.includes(product.id)) return true;
              return false;
          });

          if (applicableDiscounts.length > 0) {
              const bestDiscount = applicableDiscounts.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
              const discountAmount = (originalPrice * bestDiscount.percentage) / 100;
              return { finalPrice: originalPrice - discountAmount, originalPrice: originalPrice, hasDiscount: true, discountPercent: bestDiscount.percentage };
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
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        const { cart, calculatePrice } = get();
        return cart.reduce((acc, item) => {
          const { finalPrice } = calculatePrice(item);
          return acc + (finalPrice * item.quantity);
        }, 0);
      },

      addOrder: async (order) => {
        set((state) => ({ orders: [order, ...state.orders], cart: [] }));
        
        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            get().initialize();
        } catch (e) {
            console.error('Failed to sync order', e);
        }
      },

      updateOrderStatus: async (id, status) => {
          set((state) => ({ orders: state.orders.map(o => o.id === id ? { ...o, status } : o) }));
          try {
            await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
          } catch(e) { console.warn("API failed", e); }
      },

      deleteOrder: async (id) => {
          set((state) => ({ orders: state.orders.filter(o => o.id !== id) }));
          try {
            await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
          } catch(e) { console.warn("API failed", e); }
      },

      setStripeConfig: async (config) => {
          set({ stripeConfig: config });
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'stripe', data: config })
            });
          } catch(e) { console.warn("API failed", e); }
      },
      
      setShippingConfig: async (config) => {
          set({ shippingConfig: config });
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'shipping', data: config })
            });
          } catch(e) { console.warn("API failed", e); }
      },
      
      setSupportConfig: async (config) => {
          set((state) => ({ supportConfig: { ...state.supportConfig, ...config } }));
          // If update includes whatsappNumber, save it to DB
          if (config.whatsappNumber) {
            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'support', data: { whatsappNumber: config.whatsappNumber } })
                });
            } catch(e) { console.warn("API failed", e); }
          }
      },
      
      addFaq: async (faq) => {
          set((state) => ({ supportConfig: { ...state.supportConfig, faqs: [...state.supportConfig.faqs, faq] } }));
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'faq_add', data: faq })
            });
          } catch(e) { console.warn("API failed", e); }
      },

      deleteFaq: async (id) => {
          set((state) => ({ supportConfig: { ...state.supportConfig, faqs: state.supportConfig.faqs.filter(f => f.id !== id) } }));
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'faq_delete', data: { id } })
            });
          } catch(e) { console.warn("API failed", e); }
      },

      setMailConfig: async (config) => {
          set({ mailConfig: config });
          try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'emailjs', data: config })
            });
          } catch(e) { console.warn("API failed", e); }
      },
    }),
    { 
        name: 'tacalabala-store', 
        storage: createJSONStorage(() => localStorage), 
        partialize: (state) => ({ cart: state.cart }) 
    }
  )
);
