
import React from 'react';
import { ArrowLeft, Scale, ShoppingBag, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TermsAndConditionsProps {
  onBack: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
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
                Termini e <span className="text-[#0066b2]">Condizioni</span>
            </motion.h1>
            <p className="text-slate-500 text-sm">Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none">
            
            <p className="lead text-xl text-slate-600 font-light mb-8">
                Benvenuto su Tacalabala Milano. L'utilizzo di questo sito e l'acquisto dei prodotti comportano l'accettazione integrale dei seguenti termini.
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Scale size={24} className="text-[#0066b2]" /> 1. Condizioni Generali
            </h3>
            <p>
                Il sito è gestito da Tacalabala S.r.l. Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
                L'utente è tenuto a consultare periodicamente questa pagina. L'accesso al sito è consentito su base temporanea e ci riserviamo il diritto di ritirare o modificare i servizi senza preavviso.
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <ShoppingBag size={24} className="text-[#0066b2]" /> 2. Prodotti e Prezzi
            </h3>
            <p>
                Cerchiamo di descrivere e visualizzare i prodotti nel modo più accurato possibile. Tuttavia, non possiamo garantire che i colori visualizzati sul tuo schermo riflettano esattamente quelli reali.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Tutti i prezzi indicati sul sito sono espressi in Euro (€) e si intendono comprensivi di IVA (Imposta sul Valore Aggiunto) vigente.</strong></li>
                <li>Tutti gli ordini sono soggetti a disponibilità.</li>
                <li>Ci riserviamo il diritto di annullare ordini in caso di errori di prezzo evidenti o sospetta frode.</li>
                <li>Il contratto di vendita si conclude al momento della spedizione dell'ordine.</li>
            </ul>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <Truck size={24} className="text-[#0066b2]" /> 3. Spedizioni
            </h3>
            <p>
                Effettuiamo spedizioni in Italia e all'estero. I tempi di consegna sono stimati e non garantiti. 
                Tacalabala non è responsabile per ritardi dovuti a cause di forza maggiore o disservizi del corriere.
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <RefreshCw size={24} className="text-[#0066b2]" /> 4. Diritto di Recesso e Resi
            </h3>
            <p>
                In conformità al Codice del Consumo (D.Lgs. 206/2005), hai il diritto di recedere dal contratto entro <strong>14 giorni</strong> dalla ricezione della merce senza dover fornire alcuna motivazione.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>I prodotti devono essere restituiti integri, non indossati, non lavati e con le etichette originali.</li>
                <li><strong>Le spese di spedizione per la restituzione del bene (reso) sono interamente a carico del cliente</strong>, salvo difetti di conformità o errori di invio da parte nostra.</li>
                <li>I prodotti personalizzati (es. maglie con nome custom) non sono soggetti a reso.</li>
            </ul>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                <AlertCircle size={24} className="text-[#0066b2]" /> 5. Limitazione di Responsabilità
            </h3>
            <p>
                Tacalabala non sarà responsabile per danni diretti o indiretti derivanti dall'uso del sito o dei prodotti acquistati, salvi i casi di dolo o colpa grave previsti dalla legge.
            </p>

            <h3 className="flex items-center gap-3 font-oswald text-2xl uppercase font-bold text-slate-900 mt-12 mb-6">
                6. Legge Applicabile
            </h3>
            <p>
                Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà competente il Foro di Milano, o il foro di residenza del consumatore se previsto dalle norme vigenti.
            </p>

        </div>
      </div>
    </section>
  );
};

export default TermsAndConditions;
