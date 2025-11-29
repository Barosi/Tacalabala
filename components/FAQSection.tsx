
import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

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
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-[#0066b2]' : 'text-slate-800 group-hover:text-[#0066b2]'}`}>
                    {question}
                </span>
                <span className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-[#0066b2] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-slate-500 leading-relaxed pr-8">{answer}</p>
            </div>
        </div>
    )
}

const FAQSection: React.FC = () => {
    const { supportConfig } = useStore();

    return (
        <section className="pt-64 pb-20 bg-white border-t border-slate-100">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                     <h2 className="font-oswald text-5xl md:text-6xl font-bold uppercase mb-4 text-slate-900">
                      Domande <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0066b2] to-[#0066b2]">Frequenti</span>
                   </h2>
                     <p className="text-slate-500">Tutto quello che devi sapere su ordini, spedizioni e resi.</p>
                </div>

                <div className="bg-white rounded-3xl p-2 md:p-8">
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
            </div>
        </section>
    );
};

export default FAQSection;
