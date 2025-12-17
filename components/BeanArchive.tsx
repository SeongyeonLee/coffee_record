import React, { useState } from 'react';
import { Bean, AppView } from '../types';
import { Archive, Plus, Search, MapPin, Coffee, CheckCircle2 } from 'lucide-react';
import { COUNTRY_FLAGS } from '../constants';
import { api } from '../services/api';

interface BeanArchiveProps {
    beans: Bean[];
    onRefresh: () => void;
    onBrew: (bean: Bean) => void;
    onNavigate: (view: AppView) => void;
}

const BeanArchive: React.FC<BeanArchiveProps> = ({ beans, onRefresh, onBrew, onNavigate }) => {
    const [filter, setFilter] = useState<'Active' | 'Finished'>('Active');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const filtered = beans.filter(b => 
        (b.status === filter) && 
        (b.roaster.toLowerCase().includes(search.toLowerCase()) || 
         b.variety.toLowerCase().includes(search.toLowerCase()) ||
         b.country.toLowerCase().includes(search.toLowerCase()))
    );

    const handleArchive = async (id: string) => {
        setUpdatingId(id);
        try {
            await api.updateBeanStatus(id, 'Finished');
            onRefresh();
        } catch (e) {
            alert("Error updating status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReactivate = async (id: string) => {
        setUpdatingId(id);
        try {
            await api.updateBeanStatus(id, 'Active');
            onRefresh();
        } catch (e) {
            alert("Error updating status");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-light text-slate-100">Coffee Inventory</h1>
                    <div className="flex gap-4 mt-4">
                        <button 
                            onClick={() => setFilter('Active')}
                            className={`pb-2 px-1 text-sm font-medium transition-all border-b-2 ${filter === 'Active' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                        >
                            Active Beans ({beans.filter(b => b.status === 'Active').length})
                        </button>
                        <button 
                            onClick={() => setFilter('Finished')}
                            className={`pb-2 px-1 text-sm font-medium transition-all border-b-2 ${filter === 'Finished' ? 'text-amber-400 border-amber-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                        >
                            Archived ({beans.filter(b => b.status === 'Finished').length})
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate(AppView.ADD_BEAN)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors mb-2"
                >
                    <Plus size={18} /> New Bean
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by roaster, variety, origin..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pl-12 text-slate-100 focus:border-slate-500 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(bean => (
                    <div key={bean.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col justify-between group hover:border-slate-600 transition-all shadow-lg">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-3xl">{COUNTRY_FLAGS[bean.country] || '☕'}</span>
                                {filter === 'Active' ? (
                                    <button 
                                        disabled={updatingId === bean.id}
                                        onClick={() => handleArchive(bean.id)}
                                        className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                                        title="Finish & Archive"
                                    >
                                        <Archive size={14} />
                                        Archive
                                    </button>
                                ) : (
                                    <button 
                                        disabled={updatingId === bean.id}
                                        onClick={() => handleReactivate(bean.id)}
                                        className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                    >
                                        <CheckCircle2 size={14} />
                                        Re-activate
                                    </button>
                                )}
                            </div>
                            <h3 className="text-xl font-medium text-slate-100 mb-1">{bean.roaster}</h3>
                            <p className="text-slate-400 text-sm mb-3 flex items-center gap-1">
                                <MapPin size={14} className="text-slate-500" />
                                {bean.variety} • {bean.farm || bean.country}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-6">
                                {bean.flavorNotes.map((note, i) => (
                                    <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{note}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {filter === 'Active' && (
                                <button 
                                    onClick={() => onBrew(bean)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Coffee size={16} /> Brew
                                </button>
                            )}
                            <div className="text-right flex flex-col justify-center px-2">
                                <span className="text-xs text-slate-500">Price</span>
                                <span className="text-sm font-mono text-emerald-400">₩{bean.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                        No beans found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BeanArchive;