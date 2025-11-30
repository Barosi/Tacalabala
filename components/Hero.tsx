
import React from 'react';
import { IoIosFootball } from "react-icons/io";

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      
      {/* Background: Subtle Premium Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 z-0"></div>
      
      {/* Central Axis Line (The visual anchor for all sections) */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-[#0066b2]/10"></div>
      </div>

      {/* Pitch Perspective Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-full border-l border-r border-[#0066b2] transform perspective-[100px] rotate-x-60 scale-150 origin-bottom flex justify-center">
             {/* Center Line in Perspective */}
             <div className="h-full w-px bg-[#0066b2]/50 mx-auto"></div>
             {/* Vertical Grid Lines */}
             <div className="absolute inset-0 flex justify-around w-full h-full">
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
                <div className="h-full w-px bg-[#0066b2]/20"></div>
             </div>
          </div>
          {/* Center Circle (Half visible at bottom) */}
          <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] border-2 border-[#0066b2]/20 rounded-full pointer-events-none"></div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#0066b2] rounded-full blur-[120px] opacity-10 z-0"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto mt-0 md:mt-0 flex flex-col items-center justify-center h-full">
        
        {/* Main Title */}
        <h1 className="font-oswald text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold leading-[0.9] md:leading-[0.85] mb-8 tracking-tighter uppercase drop-shadow-sm select-none">
          <span className="block text-slate-900">Stile</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">
            Nerazzurro
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-500 text-lg md:text-2xl font-light tracking-wide max-w-3xl mx-auto leading-relaxed px-4">
          Streetwear per chi vive la partita <br className="hidden md:block"/>
          <span className="text-[#0066b2] font-semibold">oltre il novantesimo</span>.
        </p>

        {/* Kick Off Trigger */}
        <a 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 group"
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
        </a>

      </div>
    </section>
  );
};

export default Hero;
