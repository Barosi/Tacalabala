
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
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

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
}

const parsePrice = (priceStr: string | number) => {
  if (typeof priceStr === 'number') return priceStr;
  return parseFloat(priceStr.replace('€', '').replace(',', '.').trim()) || 0;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: PRODUCTS, 
      orders: [], 
      cart: [],
      discounts: [], 
      isCartOpen: false,
      
      stripeConfig: { publicKey: '', secretKey: '', webhookSecret: '', isEnabled: false },
      
      shippingConfig: {
          italyPrice: 10,
          italyThreshold: 100, // Free over 100
          foreignPrice: 25,
          foreignThreshold: 200 // Free over 200
      },

      supportConfig: {
          whatsappNumber: '', 
          faqs: [
              { id: '1', question: 'Tempi di spedizione?', answer: 'Spediamo in 24/48 ore lavorative in tutta Italia tramite corriere espresso tracciato.' },
              { id: '2', question: 'Politica di Reso?', answer: 'Hai 14 giorni dalla ricezione per effettuare il reso. Il prodotto deve essere intatto e con etichetta.' },
              { id: '3', question: 'Materiali utilizzati?', answer: 'Utilizziamo cotone premium 100% organico e tessuti tecnici traspiranti per i kit performance.' },
              { id: '4', question: 'Come scelgo la taglia?', answer: 'Le nostre maglie hanno un fit "Boxy" moderno. Consigliamo la tua taglia abituale per un look regolare, una in più per oversize.' },
              { id: '5', question: 'Metodi di pagamento?', answer: 'Accettiamo Carte di Credito, PayPal, Apple Pay, Google Pay e Bonifico Bancario.' },
              { id: '6', question: 'Posso richiedere fattura?', answer: 'Certamente. In fase di checkout puoi selezionare "Richiedi Fattura" e inserire SDI o PEC.' },
              { id: '7', question: 'Come traccio l\'ordine?', answer: 'Appena spedito riceverai una mail con il link di tracking del corriere.' },
              { id: '8', question: 'Istruzioni lavaggio?', answer: 'Lavare al rovescio a max 30°C. Non utilizzare asciugatrice per preservare le stampe.' },
              { id: '9', question: 'Spedite all\'estero?', answer: 'Sì, spediamo in tutta Europa. I costi vengono calcolati al checkout in base alla zona.' },
              { id: '10', question: 'Prodotti esauriti?', answer: 'I nostri drop sono limitati. Iscriviti alla newsletter o seguici su IG per sapere quando torneranno.' },
              { id: '11', question: 'Chi produce i kit?', answer: 'Tacalabala è un brand indipendente. Realizziamo Concept Kit e abbigliamento ispirato alla cultura calcistica.' }
          ]
      },

      mailConfig: { serviceId: '', templateId: '', publicKey: '', emailTo: '' },

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),

      addDiscount: (discount) => set((state) => ({ discounts: [...state.discounts, discount] })),
      deleteDiscount: (id) => set((state) => ({ discounts: state.discounts.filter(d => d.id !== id) })),

      calculatePrice: (product: Product) => {
          const { discounts } = get();
          const originalPrice = parsePrice(product.price);
          const now = new Date();

          // If coming soon, return standard logic (price will be hidden in UI anyway)
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
        
        // Prevent adding dropped items via code
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

      addOrder: (order) => set((state) => {
        const updatedProducts = state.products.map(product => {
            const orderItemsForProduct = order.items.filter(item => item.id === product.id);
            if (orderItemsForProduct.length === 0) return product;
            const updatedVariants = product.variants?.map(variant => {
                const boughtItem = orderItemsForProduct.find(item => item.selectedSize === variant.size);
                if (boughtItem) {
                    const newStock = Math.max(0, variant.stock - boughtItem.quantity);
                    return { ...variant, stock: newStock };
                }
                return variant;
            }) || [];
            const isNowSoldOut = updatedVariants.every(v => v.stock === 0);
            return { ...product, variants: updatedVariants, isSoldOut: isNowSoldOut };
        });
        return { orders: [order, ...state.orders], products: updatedProducts, cart: [] };
      }),
      updateOrderStatus: (id, status) => set((state) => ({ orders: state.orders.map(o => o.id === id ? { ...o, status } : o) })),
      deleteOrder: (id) => set((state) => ({ orders: state.orders.filter(o => o.id !== id) })),

      setStripeConfig: (config) => set({ stripeConfig: config }),
      setShippingConfig: (config) => set({ shippingConfig: config }),
      setSupportConfig: (config) => set((state) => ({ supportConfig: { ...state.supportConfig, ...config } })),
      addFaq: (faq) => set((state) => ({ supportConfig: { ...state.supportConfig, faqs: [...state.supportConfig.faqs, faq] } })),
      deleteFaq: (id) => set((state) => ({ supportConfig: { ...state.supportConfig, faqs: state.supportConfig.faqs.filter(f => f.id !== id) } })),
      setMailConfig: (config) => set({ mailConfig: config }),
    }),
    { name: 'tacalabala-store', storage: createJSONStorage(() => localStorage), version: 4 }
  )
);
