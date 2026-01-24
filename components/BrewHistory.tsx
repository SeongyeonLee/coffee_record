import React, { useState } from 'react';
import { Brew, Bean } from '../types';
import { Calendar, Filter, Clock, Droplets, Info, Trash2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface BrewHistoryProps {
    history: Brew[];
    beans: Bean[];
    onRefresh: () => void;
}

const BrewHistory: React.FC<BrewHistoryProps> = ({ history, beans, onRefresh }) => {
    const [filter, setFilter] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const getBeanInfo = (id: string) => beans.find(b => b.id === id);

    const filtered = history.filter(h => {
        const bean = getBeanInfo(h.beanId);
        return h.recipeName.toLowerCase().includes(filter.toLowerCase()) || 
               bean?.roaster.toLowerCase().includes(filter.toLowerCase());
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brew record?")) return;
        setDeletingId(id);
        try {
            await api.deleteBrew(id);
            onRefresh();
        } catch (e) {
            alert("Failed to delete record");
        } finally {
            setDeletingId(null);
        }
    };

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
                        <div key={brew.id || idx} className="group bg-slate-800 border border-slate-700 rounded-3xl p-6 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row gap-6 relative">
                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDelete(brew.id)}
                                  disabled={deletingId === brew.id}
                                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                >
                                  {deletingId === brew.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}
                                </button>
                            </div>

                            <div className="md:w-1/4 border-r border-slate-700/50 pr-6">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                                    <Calendar size={12} /> {brew.date}
                                </div>
                                <h3 className="text-xl font-medium text-emerald-400 truncate mb-2">{brew.recipeName}</h3>
                                <div className="text-sm text-slate-300 font-medium">{bean?.roaster}</div>
                                <div className="text-xs text-slate-500">{bean?.variety} ({bean?.country})</div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
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
                                    <span className="text-[10px] text-slate-500 uppercase mb-1">Temp</span>
                                    <span className="text-sm text-slate-200">{brew.waterTemp}°C</span>
                                </div>
                            </div>

                            <div className="md:w-1/3 bg-slate-900/30 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
                                <div className="text-xs text-slate-400 italic mb-3 line-clamp-3">
                                    "{brew.tasteReview || 'No specific notes recorded for this brew.'}"
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 text-blue-400 overflow-hidden">
                                        <Droplets size={12} className="shrink-0" />
                                        <span className="text-[10px] font-mono truncate text-slate-500">{brew.pourSteps}</span>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-500 shrink-0">₩{brew.calculatedCost.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-20 text-center text-slate-600 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
                        <Info size={40} className="mx-auto mb-4 opacity-50" />
                        <p>No records match your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrewHistory;
