
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Star } from 'lucide-react';

interface MarqueeProps {
  text?: string;
  dark?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({ 
  text = "TACALABALA MILANO • STREETWEAR CULTURE • AUTHENTIC FOOTBALL • MADE IN ITALY", 
  dark = false 
}) => {
  
  // Using exact duplication logic for a perfect CSS-based loop via Framer Motion
  const marqueeVariants: Variants = {
    animate: {
      x: ["0%", "-50%"], 
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 40, // Slower speed (increased from 20 to 40)
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className={`py-4 md:py-6 overflow-hidden relative z-30 border-y ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-[#0066b2]'}`}>
      <motion.div 
        className="flex whitespace-nowrap w-fit will-change-transform" // will-change optimization
        variants={marqueeVariants}
        animate="animate"
      >
         {/* Block 1 */}
         <div className="flex items-center flex-shrink-0">
           {[...Array(4)].map((_, i) => (
             <React.Fragment key={`a-${i}`}>
                <span className="font-oswald font-bold text-2xl md:text-4xl uppercase tracking-widest mx-4 md:mx-8 opacity-100 flex items-center gap-4 md:gap-8">
                  {text} <Star size={16} className={`mb-1 ${dark ? 'fill-white text-white' : 'fill-[#0066b2] text-[#0066b2]'}`} />
                </span>
             </React.Fragment>
           ))}
         </div>
         
         {/* Block 2 (Duplicate for Loop) */}
         <div className="flex items-center flex-shrink-0">
           {[...Array(4)].map((_, i) => (
             <React.Fragment key={`b-${i}`}>
                <span className="font-oswald font-bold text-2xl md:text-4xl uppercase tracking-widest mx-4 md:mx-8 opacity-100 flex items-center gap-4 md:gap-8">
                  {text} <Star size={16} className={`mb-1 ${dark ? 'fill-white text-white' : 'fill-[#0066b2] text-[#0066b2]'}`} />
                </span>
             </React.Fragment>
           ))}
         </div>
      </motion.div>
    </div>
  );
};

export default Marquee;
