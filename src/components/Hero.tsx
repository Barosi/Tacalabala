
import React from 'react';
import { IoIosFootball } from "react-icons/io";
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-white pt-24 pb-12 md:pb-16">
      
      {/* Background: Subtle Premium Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 z-0"></div>
      
      {/* Central Axis Line */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-[#0066b2]/10"></div>
      </div>

      {/* Pitch Perspective Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-full border-l border-r border-[#0066b2] transform perspective-[100px] rotate-x-60 scale-150 origin-bottom flex justify-center">
             <div className="h-full w-px bg-[#0066b2]/50 mx-auto"></div>
             <div className="absolute inset-0 flex justify-around w-full h-full">
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
             </div>
          </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#0066b2] rounded-full blur-[120px] opacity-10 z-0"></div>

      {/* Spacer for better vertical centering */}
      <div className="flex-[0.5] md:flex-[0.8]"></div>

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto flex flex-col items-center justify-center">
        
        {/* Main Title - Fixed Truncation: Increased Padding and Leading */}
        <h1 className="font-oswald text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-tight mb-6 tracking-tighter uppercase drop-shadow-sm select-none py-8">
          <motion.span 
            initial={{ y: 80, opacity: 0, rotate: 3 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="block text-slate-900"
          >
            Stile
          </motion.span>
          <motion.span 
            initial={{ y: 80, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]"
          >
            Nerazzurro
          </motion.span>
        </h1>
        
        {/* Subtitle */}
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-slate-500 text-lg md:text-2xl font-light tracking-wide max-w-3xl mx-auto leading-relaxed px-4 mb-4"
        >
          Streetwear per chi vive la partita <br className="hidden md:block"/>
          <span className="text-[#0066b2] font-semibold">oltre il novantesimo</span>.
        </motion.p>
      </div>

      {/* Spacer to push Kick Off to bottom */}
      <div className="flex-1"></div>

      {/* Kick Off Trigger */}
      <motion.a 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.7 }}
            className="relative z-20 flex flex-col items-center gap-4 group cursor-pointer pb-8"
            onClick={() => {
                const el = document.getElementById('products');
                el?.scrollIntoView({ behavior: 'smooth' });
            }}
        >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0066b2]">
                Kick Off
            </span>
            
            <div className="relative">
                {/* Palla */}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full animate-bounce transition-transform duration-300 group-hover:scale-110 z-10 drop-shadow-lg shadow-blue-900/10 flex items-center justify-center border border-slate-100 text-slate-900">
                   <IoIosFootball className="w-full h-full text-slate-900" />
                </div>
                {/* Ombra sincronizzata */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-black/10 rounded-[100%] blur-sm animate-pulse"></div>
            </div>
        </motion.a>

    </section>
  );
};

export default Hero;
