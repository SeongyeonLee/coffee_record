import React, { useState } from 'react';
import { Preset, PourStep } from '../types';
import { Settings, Plus, Save, Trash2, Droplets, Clock, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface PresetManagerProps {
    presets: Preset[];
    onRefresh: () => void | Promise<void>;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pourSteps, setPourSteps] = useState<PourStep[]>([{ time: '0:00', amount: 0 }]);

    const [formData, setFormData] = useState<Omit<Preset, 'id' | 'pourSteps'>>({
        recipeName: '',
        grinder: '',
        clicks: 25,
        dripper: '',
        temp: 93,
    });

    const addStep = () => setPourSteps([...pourSteps, { time: '', amount: 0 }]);
    const removeStep = (idx: number) => setPourSteps(pourSteps.filter((_, i) => i !== idx));
    const updateStep = (idx: number, field: keyof PourStep, val: string | number) => {
      const newSteps = [...pourSteps];
      newSteps[idx] = { ...newSteps[idx], [field]: val };
      setPourSteps(newSteps);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.addPreset({ ...formData, pourSteps: JSON.stringify(pourSteps) });
            onRefresh();
            setIsAdding(false);
            setPourSteps([{ time: '0:00', amount: 0 }]);
            setFormData({ recipeName: '', grinder: '', clicks: 25, dripper: '', temp: 93 });
        } catch (e) {
            console.error(e);
            alert("Error saving preset");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
      if (!confirm("Delete this recipe preset?")) return;
      setDeletingId(id);
      try {
        await api.deletePreset(id);
        onRefresh();
      } catch (e) {
        console.error(e);
        alert("Failed to delete");
      } finally {
        setDeletingId(null);
      }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light text-slate-100">Recipe Presets</h1>
                    <p className="text-slate-500 mt-1">Manage your professional brewing routines.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg"
                >
                    {isAdding ? 'Cancel' : <><Plus size={18} /> New Preset</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800 border border-slate-700 rounded-[2rem] p-8 shadow-2xl animate-scale-in">
                    <h2 className="text-2xl text-slate-100 mb-8 flex items-center gap-2">
                        <Settings size={24} className="text-blue-400" />
                        Create New Recipe Routine
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Routine Name</label>
                                    <input required value={formData.recipeName} onChange={e => setFormData({...formData, recipeName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none" placeholder="e.g. V60 4:6 Method" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Grinder</label>
                                        <input required value={formData.grinder} onChange={e => setFormData({...formData, grinder: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Setting</label>
                                        <input type="number" value={formData.clicks} onChange={e => setFormData({...formData, clicks: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Dripper</label>
                                        <input required value={formData.dripper} onChange={e => setFormData({...formData, dripper: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Temp (°C)</label>
                                        <input type="number" value={formData.temp} onChange={e => setFormData({...formData, temp: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Pouring Steps</label>
                                <div className="space-y-3">
                                  {pourSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                      <input value={step.time} onChange={e => updateStep(idx, 'time', e.target.value)} placeholder="0:00" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono" />
                                      <input type="number" value={step.amount} onChange={e => updateStep(idx, 'amount', Number(e.target.value))} placeholder="Amount (g)" className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono" />
                                      <button type="button" onClick={() => removeStep(idx)} className="text-slate-600 hover:text-red-400 p-2"><Trash2 size={16}/></button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={addStep} className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 text-xs hover:border-slate-500 transition-all">+ Add Step</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-blue-900/20">
                                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20} /> Save Routine</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {presets.map((p) => {
                    let parsedPour = [];
                    try { parsedPour = JSON.parse(p.pourSteps); } catch(e) {}
                    return (
                        <div key={p.id} className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                              <Settings size={120} />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-light text-slate-100">{p.recipeName}</h3>
                                <button 
                                  onClick={() => handleDelete(p.id)}
                                  disabled={deletingId === p.id}
                                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                >
                                  {deletingId === p.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={18} />}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Grinder</div>
                                    <div className="text-sm font-medium text-slate-300 truncate">{p.grinder}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Setting</div>
                                    <div className="text-sm font-medium text-slate-300">{p.clicks}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Temp</div>
                                    <div className="text-sm font-medium text-slate-300">{p.temp}°C</div>
                                </div>
                            </div>

                            <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-700/50">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Droplets size={12} className="text-blue-500" /> Pour Sequence
                                </div>
                                <div className="space-y-3">
                                  {Array.isArray(parsedPour) ? parsedPour.map((step: PourStep, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={10} className="text-slate-600" />
                                        <span className="font-mono">{step.time}</span>
                                      </div>
                                      <div className="font-mono text-slate-200">{step.amount}g</div>
                                    </div>
                                  )) : <div className="text-xs text-slate-600">{p.pourSteps}</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {presets.length === 0 && !isAdding && (
                    <div className="col-span-full py-24 bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                        <Settings size={40} className="mb-4 opacity-30" />
                        <p>No routines saved yet. Define your first extraction profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PresetManager;