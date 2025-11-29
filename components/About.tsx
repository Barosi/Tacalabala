
import React, { useEffect, useRef } from 'react';
import { MapPin, Palette, Trophy, PenTool } from 'lucide-react';

const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            entry.target.classList.remove('reveal-hidden');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const elements = sectionRef.current?.querySelectorAll('.reveal-hidden');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Central Axis Continuity */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0">
          <div className="w-px h-full bg-slate-100 border-l border-dashed border-slate-300"></div>
      </div>

      {/* Tactical Board Markings (Centered on Axis) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
         {/* Center Circle */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] border-2 border-black rounded-full"></div>
         {/* Midfield Line */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-black"></div>
         {/* Outer Box */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border-2 border-black rounded-[2rem]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20 reveal-hidden transition-reveal">
            <span className="inline-block py-1 px-3 border border-[#0066b2] rounded-full bg-blue-50 text-[#0066b2] font-bold tracking-[0.2em] text-[10px] uppercase mb-8">Tactical Analysis</span>
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase leading-[1.2] mb-4">Non è solo <span className="text-slate-300">Calcio</span>.</h2>
            <h2 className="font-oswald text-5xl md:text-7xl font-bold uppercase leading-[1.2] mb-6">È <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-[#0066b2]">Identità</span>.</h2>
            <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto"><strong className="text-black">Tacalabala</strong> riscrive le regole. Uniamo la tradizione di San Siro con l'estetica streetwear di Milano.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden reveal-hidden transition-reveal" style={{ transitionDelay: '0ms' }}>
                <div className="absolute -right-6 -top-6 text-slate-100 opacity-50 group-hover:text-blue-50 group-hover:opacity-100 transition-colors duration-500"><Trophy size={140} strokeWidth={1} /></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#0066b2] rounded-2xl"><Trophy size={24} className="text-[#0066b2]" /></div>
                    <h3 className="text-slate-900 font-oswald text-2xl uppercase mb-4 group-hover:text-[#0066b2] transition-colors">DNA Vincente</h3>
                    <p className="text-slate-500 text-sm leading-7">Ispirati dalle notti europee e dagli scudetti. Ogni dettaglio racconta una vittoria, ogni cucitura una leggenda.</p>
                </div>
            </div>
            <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden reveal-hidden transition-reveal" style={{ transitionDelay: '150ms' }}>
                <div className="absolute -right-6 -top-6 text-slate-100 opacity-50 group-hover:text-blue-50 group-hover:opacity-100 transition-colors duration-500"><PenTool size={140} strokeWidth={1} /></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#0066b2] rounded-2xl"><Palette size={24} className="text-black" /></div>
                    <h3 className="text-slate-900 font-oswald text-2xl uppercase mb-4 group-hover:text-[#0066b2] transition-colors">Design Custom</h3>
                    <p className="text-slate-500 text-sm leading-7">Grafiche concettuali che rompono gli schemi. Non facciamo repliche, creiamo pezzi unici da collezione.</p>
                </div>
            </div>
            <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-[2rem] hover:border-[#0066b2] transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden reveal-hidden transition-reveal" style={{ transitionDelay: '300ms' }}>
                <div className="absolute -right-6 -top-6 text-slate-100 opacity-50 group-hover:text-blue-50 group-hover:opacity-100 transition-colors duration-500"><MapPin size={140} strokeWidth={1} /></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#0066b2] rounded-2xl"><MapPin size={24} className="text-[#0066b2]" /></div>
                    <h3 className="text-slate-900 font-oswald text-2xl uppercase mb-4 group-hover:text-[#0066b2] transition-colors">Made in Milano</h3>
                    <p className="text-slate-500 text-sm leading-7">Dalla Madonnina ai quartieri popolari. Portiamo l'eleganza e la grinta di Milano in ogni design.</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
export default About;
