import React, { useState } from 'react';
import { Bean, AppView } from '../types';
import { Archive, Plus, Search, MapPin, Coffee, CheckCircle2, Info } from 'lucide-react';
import { COUNTRY_FLAGS } from '../constants';
import { api } from '../services/api';
import BeanDetailModal from './BeanDetailModal';

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
    const [selectedDetailBean, setSelectedDetailBean] = useState<Bean | null>(null);

    const filtered = beans.filter(b => 
        (b.status === filter) || (filter === 'Finished' && b.status === 'Finished') || (filter === 'Active' && b.status === 'Active')
    ).filter(b => 
        b.roaster.toLowerCase().includes(search.toLowerCase()) || 
        b.variety.toLowerCase().includes(search.toLowerCase()) ||
        b.country.toLowerCase().includes(search.toLowerCase())
    );

    const handleArchive = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
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

    const handleReactivate = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
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

    const handleBrewClick = (e: React.MouseEvent, bean: Bean) => {
        e.stopPropagation();
        onBrew(bean);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {selectedDetailBean && (
              <BeanDetailModal bean={selectedDetailBean} onClose={() => setSelectedDetailBean(null)} />
            )}

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
                    <div 
                      key={bean.id} 
                      onClick={() => setSelectedDetailBean(bean)}
                      className="bg-slate-800 rounded-[2rem] border border-slate-700 p-6 flex flex-col justify-between group hover:border-slate-500 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Evocative background decoration */}
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                          <Coffee size={120} />
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-4xl filter drop-shadow-md">{COUNTRY_FLAGS[bean.country] || '☕'}</span>
                                {filter === 'Active' ? (
                                    <button 
                                        disabled={updatingId === bean.id}
                                        onClick={(e) => handleArchive(e, bean.id)}
                                        className="text-xs bg-slate-900/50 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 p-2 rounded-full transition-all border border-transparent hover:border-amber-500/30"
                                        title="Archive"
                                    >
                                        <Archive size={16} />
                                    </button>
                                ) : (
                                    <button 
                                        disabled={updatingId === bean.id}
                                        onClick={(e) => handleReactivate(e, bean.id)}
                                        className="text-xs bg-slate-900/50 hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 p-2 rounded-full transition-all border border-transparent hover:border-blue-500/30"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                )}
                            </div>
                            <h3 className="text-2xl font-light text-slate-100 mb-1 group-hover:text-white transition-colors">{bean.roaster}</h3>
                            <p className="text-slate-400 text-sm mb-4 flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-500" />
                                {bean.variety} • {bean.country}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {bean.flavorNotes.slice(0, 3).map((note, i) => (
                                    <span key={i} className="text-[10px] uppercase tracking-widest font-bold bg-slate-900/50 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                                      {note}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {filter === 'Active' && (
                                <button 
                                    onClick={(e) => handleBrewClick(e, bean)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    <Coffee size={18} /> Brew Now
                                </button>
                            )}
                            <button className="p-3 bg-slate-700/50 rounded-2xl text-slate-400 hover:text-white transition-colors">
                              <Info size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center">
                        <Coffee size={40} className="mb-4 opacity-20" />
                        No beans found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BeanArchive;
