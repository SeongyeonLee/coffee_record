import React, { useState } from 'react';
import { Brew, Bean } from '../types';
import { Calendar, Filter, Clock, Droplets, Info } from 'lucide-react';

interface BrewHistoryProps {
    history: Brew[];
    beans: Bean[];
}

const BrewHistory: React.FC<BrewHistoryProps> = ({ history, beans }) => {
    const [filter, setFilter] = useState('');

    const getBeanInfo = (id: string) => beans.find(b => b.id === id);

    const filtered = history.filter(h => {
        const bean = getBeanInfo(h.beanId);
        return h.recipeName.toLowerCase().includes(filter.toLowerCase()) || 
               bean?.roaster.toLowerCase().includes(filter.toLowerCase());
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-light text-slate-100">Brewing History</h1>
                    <p className="text-slate-500 mt-1">Every cup you've brewed, remembered.</p>
                </div>
                <div className="relative w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Filter logs..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-9 text-sm text-slate-100 outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map((brew, idx) => {
                    const bean = getBeanInfo(brew.beanId);
                    return (
                        <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/4 border-r border-slate-700/50 pr-6">
                                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mb-1">
                                    <Calendar size={12} /> {brew.date}
                                </div>
                                <h3 className="text-lg font-medium text-emerald-400 truncate">{brew.recipeName}</h3>
                                <div className="text-sm text-slate-300 font-medium mt-2">{bean?.roaster}</div>
                                <div className="text-xs text-slate-500">{bean?.variety} ({bean?.country})</div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase mb-1">Dripper</span>
                                    <span className="text-sm text-slate-200">{brew.dripper} ({brew.filterType})</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase mb-1">Grind</span>
                                    <span className="text-sm text-slate-200">{brew.grinder} • {brew.clicks}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1">
                                        <Clock size={10} /> Time
                                    </span>
                                    <span className="text-sm text-slate-200">{brew.totalTime}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase mb-1">Water Temp</span>
                                    <span className="text-sm text-slate-200">{brew.waterTemp}°C</span>
                                </div>
                            </div>

                            <div className="md:w-1/3 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                                <div className="text-xs text-slate-400 italic mb-2 line-clamp-2">
                                    "{brew.tasteReview || 'No review written.'}"
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                                    <div className="flex items-center gap-1 text-blue-400">
                                        <Droplets size={12} />
                                        <span className="text-[10px] font-mono truncate">{brew.pourSteps}</span>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-500">₩{brew.calculatedCost.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-20 text-center text-slate-600 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
                        <Info size={40} className="mx-auto mb-4 opacity-50" />
                        <p>No brewing records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrewHistory;