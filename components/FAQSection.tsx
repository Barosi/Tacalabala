
import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, Variants } from 'framer-motion';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 md:py-6 flex items-center justify-between text-left group"
            >
                <span className={`font-bold text-base md:text-lg transition-colors pr-4 ${isOpen ? 'text-[#0066b2]' : 'text-slate-800 group-hover:text-[#0066b2]'}`}>
                    {question}
                </span>
                <span className={`p-2 rounded-full flex-shrink-0 transition-colors ${isOpen ? 'bg-[#0066b2] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-slate-500 leading-relaxed pr-8 text-sm md:text-base">{answer}</p>
            </div>
        </div>
    )
}

const FAQSection: React.FC = () => {
    const { supportConfig } = useStore();

    const fadeIn: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <section className="pt-32 md:pt-48 pb-16 md:pb-20 bg-white border-t border-slate-100">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                >
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase mb-4 text-slate-900 leading-tight">
                        Domande <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Frequenti</span>
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base px-4">Tutto quello che devi sapere su ordini, spedizioni e resi.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100/50 shadow-sm">
                        {supportConfig.faqs.length > 0 ? (
                            supportConfig.faqs.map(faq => (
                                <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <p>Nessuna domanda frequente disponibile al momento.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
