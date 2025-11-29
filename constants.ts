
import { Product } from './types';

// Images: Using Unsplash for reliable loading. 
export const LOGO_URL = "https://i.postimg.cc/k2ZN0LNT/logo.png"; 

// Fallback high-quality football shirt images (Direct Links from Unsplash)
export const BLACK_SHIRT_IMAGE="https://i.postimg.cc/SN8t0V0Q/Gemini-Generated-Image-w4mdfww4mdfww4md-2.png";
export const WHITE_SHIRT_IMAGE="https://i.postimg.cc/G2h4kMRc/Gemini-Generated-Image-xcuv8vxcuv8vxcuv-2.png";

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Inter Snake Custom Concept',
    season: 'Streetwear Edition',
    price: '€45',
    imageUrl: BLACK_SHIRT_IMAGE,
    size: 'S - XL',
    condition: 'Nuova (Custom)',
    description: 'Una reinterpretazione audace del simbolo di Milano. Il biscione avvolge lo stemma in un design custom esclusivo. Cotone premium, stampa alta definizione.',
    isSoldOut: false,
    tags: ['Custom Design', 'Streetwear'],
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 0 }, // Out of stock example
      { size: 'XL', stock: 20 },
    ]
  },
  {
    id: '2',
    title: 'Arena Family White Kit',
    season: 'Lifestyle Collection',
    price: '€40',
    imageUrl: WHITE_SHIRT_IMAGE,
    size: 'S - XL',
    condition: 'Nuova (Custom)',
    description: 'Il concept kit perfetto per la famiglia nerazzurra. Base bianca pulita con grafica artistica sul retro che celebra la nostra storia in chiave moderna.',
    isSoldOut: false,
    tags: ['Lifestyle', 'Concept'],
    variants: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 1 },
      ]
  },
];

export const INSTAGRAM_URL = "https://www.instagram.com/tacalabala.it/";
