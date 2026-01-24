import React, { useState } from 'react';
import { CafeLog, CafeLogFormData } from '../../types';
import { api } from '../../services/api';
import { Coffee, MapPin, Save, X } from 'lucide-react';
import { COMMON_FLAVORS, FLAVOR_COLORS } from '../../constants';

interface CafeLogFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

const CafeLogForm: React.FC<CafeLogFormProps> = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState<CafeLogFormData>({
        date: new Date().toISOString().split('T')[0],
        cafeName: '',
        beanName: '',
        price: 0,
        review: '',
        flavorNotes: [] as string[]
    });

    const toggleFlavor = (flavor: string) => {
        setFormData(prev => {
            const current = prev.flavorNotes || [];
            if (current.includes(flavor)) {
                return { ...prev, flavorNotes: current.filter(f => f !== flavor) };
            }
            if (current.length >= 3) return prev; 
            return { ...prev, flavorNotes: [...current, flavor] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addCafeLog(formData);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error saving log');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl relative">
                {onCancel && (
                    <button onClick={onCancel} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                )}
                
                <h2 className="text-xl font-light text-slate-100 mb-6 flex items-center gap-2">
                    <MapPin className="text-purple-400" size={20} /> 
                    New Cafe Visit
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Cafe Name</label>
                        <input 
                            required 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 outline-none" 
                            value={formData.cafeName}
                            onChange={e => setFormData({...formData, cafeName: e.target.value})}
                            placeholder="e.g. Blue Bottle"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Bean / Drink Name</label>
                        <div className="relative">
                            <input 
                                required 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-slate-200 placeholder-slate-600 focus:border-purple-500/50 outline-none" 
                                value={formData.beanName}
                                onChange={e => setFormData({...formData, beanName: e.target.value})}
                                placeholder="e.g. Latte or Kenya AA"
                            />
                            <Coffee className="absolute left-3 top-3.5 text-slate-500" size={16}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Price (₩)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    required 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-slate-200 focus:border-purple-500/50 outline-none" 
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                />
                                <span className="absolute left-3 top-3.5 text-emerald-500 font-bold text-sm">₩</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                            <input 
                                type="date" 
                                required 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-purple-500/50 outline-none" 
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-3">Flavor Notes (Max 3)</label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_FLAVORS.map(flavor => {
                                const isSelected = formData.flavorNotes?.includes(flavor);
                                const colorClass = FLAVOR_COLORS[flavor] || 'from-gray-600 to-gray-700';
                                return (
                                    <button
                                        key={flavor}
                                        type="button"
                                        onClick={() => toggleFlavor(flavor)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                            isSelected 
                                            ? `bg-gradient-to-r ${colorClass} text-white shadow-md ring-1 ring-white/20` 
                                            : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                                        }`}
                                    >
                                        {flavor}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Review</label>
                        <textarea 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 h-24 placeholder-slate-600 focus:border-purple-500/50 outline-none resize-none" 
                            value={formData.review}
                            onChange={e => setFormData({...formData, review: e.target.value})}
                            placeholder="How was the experience?"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                    >
                         {loading ? 'Saving...' : <><Save size={18}/> Save Journal Entry</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CafeLogForm;