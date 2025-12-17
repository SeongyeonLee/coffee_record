import React, { useState } from 'react';
import { Preset } from '../types';
import { Settings, Plus, Save, Trash2, Droplets, Info } from 'lucide-react';
import { api } from '../services/api';

interface PresetManagerProps {
    presets: Preset[];
    onRefresh: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Preset>({
        recipeName: '',
        grinder: '',
        clicks: 20,
        dripper: '',
        temp: 93,
        pourSteps: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addPreset(formData);
            onRefresh();
            setIsAdding(false);
            setFormData({ recipeName: '', grinder: '', clicks: 20, dripper: '', temp: 93, pourSteps: '' });
        } catch (e) {
            alert("Error saving preset");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light text-slate-100">Recipe Presets</h1>
                    <p className="text-slate-500 mt-1">Manage your go-to brewing methods.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {isAdding ? 'Cancel' : <><Plus size={18} /> New Preset</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl animate-scale-in">
                    <h2 className="text-xl text-slate-200 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-blue-400" />
                        Create New Recipe
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Recipe Name</label>
                                    <input required value={formData.recipeName} onChange={e => setFormData({...formData, recipeName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200" placeholder="e.g. V60 Tetsu Kasuya" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Grinder</label>
                                        <input required value={formData.grinder} onChange={e => setFormData({...formData, grinder: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200" placeholder="e.g. Comandante" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Clicks</label>
                                        <input type="number" value={formData.clicks} onChange={e => setFormData({...formData, clicks: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Dripper</label>
                                        <input required value={formData.dripper} onChange={e => setFormData({...formData, dripper: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200" placeholder="e.g. V60 02" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Water Temp (°C)</label>
                                        <input type="number" value={formData.temp} onChange={e => setFormData({...formData, temp: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                                        <Droplets size={12} /> Pouring Guide
                                    </label>
                                    <input required value={formData.pourSteps} onChange={e => setFormData({...formData, pourSteps: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm text-slate-200" placeholder="e.g. 50-70-60-60 (300 total)" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
                                {loading ? 'Saving...' : <><Save size={18} /> Save Preset</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {presets.map((p, idx) => (
                    <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-medium text-slate-100">{p.recipeName}</h3>
                            <button className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Grinder</div>
                                <div className="text-sm font-medium text-slate-300 truncate">{p.grinder}</div>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Clicks</div>
                                <div className="text-sm font-medium text-slate-300">{p.clicks}</div>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Temp</div>
                                <div className="text-sm font-medium text-slate-300">{p.temp}°C</div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                            <Droplets size={16} className="text-blue-500 mt-0.5" />
                            <div className="text-sm font-mono text-slate-400 break-all">{p.pourSteps}</div>
                        </div>
                    </div>
                ))}
                {presets.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                        <Info size={40} className="mb-4 opacity-50" />
                        <p>No presets saved yet. Create your first brewing recipe!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PresetManager;