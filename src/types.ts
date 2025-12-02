
export type Size = 'S' | 'M' | 'L' | 'XL';

export interface ProductVariant {
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  articleCode: string; // SKU obbligatorio
  title: string;
  brand?: string; 
  kitType?: string; 
  year?: string; 
  season: string; 
  price: string; 
  imageUrl: string; // Immagine principale (fallback)
  images?: string[]; // Galleria immagini (Base64 o URL)
  size: string; 
  condition: string; 
  description: string;
  isSoldOut: boolean;
  tags: string[];
  instagramUrl?: string;
  dropDate?: string; 
  variants?: ProductVariant[];
}

export interface Discount {
  id: string;
  name: string;
  code?: string; // Codice Coupon (es. SUMMER20)
  discountType: 'automatic' | 'coupon'; // Distinzione tipo
  percentage: number;
  startDate: string; 
  endDate: string;   
  targetType: 'all' | 'specific';
  targetProductIds?: string[];
  isActive: boolean;
}

export interface ShippingConfig {
  italyPrice: number;
  italyThreshold: number; 
  foreignPrice: number;
  foreignThreshold: number;
}

export interface CartItem extends Product {
  cartId: string;
  selectedSize: Size;
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerEmail: string;
  customerName?: string;
  shippingAddress?: string;
  total: number;
  shippingCost?: number;
  items: CartItem[];
  date: string;
  status: OrderStatus;
  invoiceDetails?: {
      taxId: string;
      vatNumber: string;
      sdiCode: string;
  };
  trackingCode?: string;
  courier?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  isEnabled: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface SupportConfig {
  whatsappNumber: string; 
  whatsappApiKey?: string; 
  faqs: FAQ[];
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'editor';
}
