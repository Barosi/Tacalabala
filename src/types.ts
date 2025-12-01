
export type Size = 'S' | 'M' | 'L' | 'XL';

export interface ProductVariant {
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  articleCode?: string; // SKU / Codice interno
  title: string;
  brand?: string; // Nike, Adidas, Umbro, Custom...
  kitType?: string; // Home, Away, Third, Training...
  year?: string; // 1997/98, 2024, etc.
  season: string; // Visual label (es. "Streetwear Edition")
  price: string; // es. "€45"
  imageUrl: string;
  size: string; 
  condition: string; // BNIB, Excellent, Good...
  description: string;
  isSoldOut: boolean;
  tags: string[];
  instagramUrl?: string;
  dropDate?: string; // ISO String for Coming Soon logic
  variants?: ProductVariant[];
}

export interface Discount {
  id: string;
  name: string;
  percentage: number;
  startDate: string; 
  endDate: string;   
  targetType: 'all' | 'specific';
  targetProductIds?: string[];
  isActive: boolean;
}

export interface ShippingConfig {
  italyPrice: number;
  italyThreshold: number; // Free shipping over this amount
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
