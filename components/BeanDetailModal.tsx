import React from 'react';
import { Bean } from '../types';
import { X, Map, Mountain, Info, Coffee, Calendar, Star, Wind } from 'lucide-react';
import { COUNTRY_FLAGS, FLAVOR_COLORS } from '../constants';

interface BeanDetailModalProps {
  bean: Bean;
  onClose: () => void;
}

const BeanDetailModal: React.FC<BeanDetailModalProps> = ({ bean, onClose }) => {
  // Use first flavor to determine background feel
  const mainFlavor = bean.flavorNotes[0] || 'Sweet';
  const colorKey = Object.keys(FLAVOR_COLORS).find(k => mainFlavor.toLowerCase().includes(k.toLowerCase())) || 'Sweet';
  const gradient = FLAVOR_COLORS[colorKey] || 'from-slate-800 to-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]">
        {/* Aesthetic Left Panel */}
        <div className={`w-full md:w-1/2 bg-gradient-to-br ${gradient} p-8 md:p-12 flex flex-col justify-between relative`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Coffee size={240} className="rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-white/60 mb-2">Original Selection</div>
            <h2 className="text-5xl font-extralight text-white leading-tight mb-4">{bean.roaster}</h2>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full self-start w-fit">
               <span className="text-2xl">{COUNTRY_FLAGS[bean.country] || '☕'}</span>
               <span className="text-sm font-medium text-white">{bean.country}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
             <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Estate & Region</div>
                <div className="text-xl text-white font-light">{bean.farm || 'Common Lot'} • {bean.region}</div>
             </div>
             <div className="flex gap-12">
                <div>
                   <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Process</div>
                   <div className="text-lg text-white font-light">{bean.process}</div>
                </div>
                <div>
                   <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Altitude</div>
                   <div className="text-lg text-white font-light flex items-center gap-1">
                      <Mountain size={14} /> {bean.altitude} masl
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Content Right Panel */}
        <div className="flex-1 bg-slate-900 p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-end mb-8">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={24} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Wind size={14} /> Sensory Profile
              </h3>
              <div className="flex flex-wrap gap-3">
                 {bean.flavorNotes.map((note, i) => (
                    <div key={i} className="px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-lg font-light hover:border-slate-500 transition-all">
                       {note}
                    </div>
                 ))}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-8">
               <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Star size={14} /> Variety
                  </h3>
                  <div className="text-slate-200 text-lg font-light">{bean.variety}</div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Calendar size={14} /> Purchased
                  </h3>
                  <div className="text-slate-200 text-lg font-light">{bean.purchaseDate}</div>
               </div>
            </section>

            <section className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800">
               <div className="text-xs text-slate-500 uppercase mb-4 flex items-center gap-2">
                  <Info size={14} /> Inventory Detail
               </div>
               <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-mono text-emerald-400">₩{bean.price.toLocaleString()}</div>
                    <div className="text-sm text-slate-400 mt-1">Cost for {bean.weight}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-slate-300 font-medium">₩{Math.round(bean.price / bean.weight)}/g</div>
                    <div className="text-xs text-slate-500">Price per gram</div>
                  </div>
               </div>
            </section>

            {/* EVOCATIVE QUOTE/STORYPLACEHOLDER */}
            <div className="pt-8 italic text-slate-500 font-serif text-lg leading-relaxed border-t border-slate-800">
              "The coffee grown in the heights of {bean.region} carries the soul of the mountain air and the mineral richness of its soil, expressing a character as unique as the terrain itself."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeanDetailModal;
