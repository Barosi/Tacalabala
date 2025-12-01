
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server, Cookie, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <section className="pt-32 md:pt-48 pb-24 bg-white min-h-screen relative">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <div className="mb-12">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0066b2] font-bold uppercase text-[10px] tracking-widest transition-colors mb-8">
                <ArrowLeft size={14} /> Torna alla Home
            </button>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-oswald text-4xl md:text-6xl font-bold uppercase text-slate-900 mb-4"
            >
                Privacy & <span className="text-[#0066b2]">Cookie Policy</span>
            </motion.h1>
            <p className="text-slate-500 text-sm">Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-12">
                <p className="font-bold text-slate-900 text-lg mb-2">Titolare del Trattamento</p>
                <p className="text-sm text-slate-600 mb-0">
                    Tacalabala S.r.l.<br/>
                    Sede Legale: Via del Calcio 10, 20100 Milano (MI)<br/>
                    P.IVA / C.F.: 12345678901<br/>
                    PEC: tacalabala@legalmail.it<br/>
                    Email: privacy@tacalabala.it
                </p>
            </div>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Eye size={24} className="text-[#0066b2]" /> 1. Quali dati raccogliamo
            </h3>
            <p>
                Raccogliamo diversi tipi di informazioni per fornire e migliorare il nostro servizio:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Dati di navigazione:</strong> Indirizzi IP, tipo di browser, pagine visitate (tramite Cookie).</li>
                <li><strong>Dati di contatto:</strong> Nome, email, numero di telefono (quando compili i form).</li>
                <li><strong>Dati di acquisto:</strong> Indirizzo di spedizione, dati di fatturazione, cronologia ordini.</li>
                <li><strong>Dati di pagamento:</strong> Non salviamo i dati completi della tua carta di credito. I pagamenti sono processati in modo sicuro tramite Stripe.</li>
            </ul>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Server size={24} className="text-[#0066b2]" /> 2. Come utilizziamo i dati
            </h3>
            <p>I tuoi dati vengono trattati per le seguenti finalità:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Gestione ed evasione degli ordini.</li>
                <li>Assistenza clienti e supporto pre/post vendita.</li>
                <li>Invio di comunicazioni transazionali (conferme d'ordine, tracking).</li>
                <li>Marketing e Newsletter (solo previo tuo esplicito consenso).</li>
                <li>Adempimento di obblighi legali e fiscali.</li>
            </ul>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Cookie size={24} className="text-[#0066b2]" /> 3. Cookie Policy & Google Analytics
            </h3>
            <p>
                Questo sito utilizza cookie per migliorare la tua esperienza.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Cookie Tecnici:</strong> Necessari per il funzionamento del sito (es. carrello, sessione). Non richiedono consenso.</li>
                <li><strong>Cookie Analitici (Google Analytics):</strong> Utilizzati per analizzare statisticamente il traffico sul sito in forma anonima. Questi cookie vengono installati <strong>solo previo tuo consenso</strong> espresso tramite il banner.</li>
            </ul>
            <p className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm">
                Puoi revocare il consenso in qualsiasi momento o gestire le tue preferenze tramite le impostazioni del browser o contattandoci.
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Lock size={24} className="text-[#0066b2]" /> 4. Sicurezza e Condivisione
            </h3>
            <p>
                Adottiamo misure di sicurezza adeguate per proteggere i tuoi dati da accessi non autorizzati. 
                Non vendiamo i tuoi dati a terzi. Condividiamo i dati solo con fornitori necessari all'erogazione del servizio (es. corrieri per la spedizione, Stripe per i pagamenti).
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Shield size={24} className="text-[#0066b2]" /> 5. I tuoi diritti (GDPR)
            </h3>
            <p>In conformità al Regolamento UE 2016/679 (GDPR), hai diritto a:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Accedere ai tuoi dati personali.</li>
                <li>Chiedere la rettifica o la cancellazione degli stessi.</li>
                <li>Opporti al trattamento o chiederne la limitazione.</li>
                <li>Richiedere la portabilità dei dati.</li>
            </ul>
            <p className="mt-6 text-sm text-slate-500">
                Per esercitare questi diritti, contattaci all'indirizzo email sopra indicato.
            </p>

        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
