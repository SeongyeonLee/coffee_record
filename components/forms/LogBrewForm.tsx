
import React, { useState, useEffect } from 'react';
import { Bean, Brew, Preset, PourStep } from '../../types';
import { api } from '../../services/api';
// Added Loader2 to the imports to resolve "Cannot find name 'Loader2'" error
import { Clock, Droplets, Save, RefreshCw, Flame, Plus, Trash2, Loader2 } from 'lucide-react';

interface LogBrewFormProps {
  selectedBean: Bean;
  onSuccess: () => void;
}

const LogBrewForm: React.FC<LogBrewFormProps> = ({ selectedBean, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [cost, setCost] = useState<number>(0);
  
  const [pourSteps, setPourSteps] = useState<PourStep[]>([
    { time: '0:00', amount: 50 },
    { time: '0:45', amount: 100 },
    { time: '1:30', amount: 100 }
  ]);

  const [formData, setFormData] = useState<Partial<Brew>>({
    beanId: selectedBean.id,
    date: new Date().toISOString().split('T')[0],
    recipeName: 'V60 Standard',
    grinder: 'Comandante',
    clicks: 25,
    dripper: 'V60',
    filterType: 'Paper',
    waterTemp: 93,
    totalTime: '2:30',
    tasteReview: '',
    calculatedCost: 0,
  });
  
  const [dose, setDose] = useState<number>(18);
  const totalWater = pourSteps.reduce((acc, curr) => acc + curr.amount, 0);

  useEffect(() => {
    api.getPresets().then(setPresets).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedBean.price && selectedBean.weight && dose) {
      const pricePerGram = selectedBean.price / selectedBean.weight;
      const calculated = pricePerGram * dose;
      setCost(calculated);
      setFormData(prev => ({ ...prev, calculatedCost: parseFloat(calculated.toFixed(2)) }));
    }
  }, [dose, selectedBean]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addStep = () => setPourSteps([...pourSteps, { time: '', amount: 0 }]);
  const removeStep = (idx: number) => setPourSteps(pourSteps.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: keyof PourStep, val: string | number) => {
    const newSteps = [...pourSteps];
    newSteps[idx] = { ...newSteps[idx], [field]: val };
    setPourSteps(newSteps);
  };

  const loadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    const preset = presets.find(p => p.recipeName === presetName);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        recipeName: preset.recipeName,
        grinder: preset.grinder,
        clicks: preset.clicks,
        dripper: preset.dripper,
        waterTemp: preset.temp,
      }));
      try {
        const parsedSteps = JSON.parse(preset.pourSteps);
        if (Array.isArray(parsedSteps)) setPourSteps(parsedSteps);
      } catch (e) {
        // Fallback for old string format
        setPourSteps([{ time: '0:00', amount: 0 }]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalData = {
        ...formData,
        pourSteps: JSON.stringify(pourSteps)
      };
      await api.addBrew(finalData as Omit<Brew, 'id'>);
      onSuccess();
    } catch (error) {
      alert('Failed to log brew');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
           <h2 className="text-3xl font-light text-slate-100">Log Brew Record</h2>
           <p className="text-slate-500 text-sm mt-1">
             Bean: <span className="text-blue-400 font-medium">{selectedBean.roaster}</span> • {selectedBean.variety}
           </p>
        </div>
        <div className="text-right">
            <span className="block text-xs text-slate-500 uppercase tracking-widest">Coffee Cost</span>
            <span className="text-4xl font-light text-emerald-400">₩{Math.round(cost).toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recipe Presets</h3>
                <div>
                    <div className="relative">
                        <select onChange={loadPreset} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-blue-500 appearance-none outline-none">
                            <option value="">Custom Recipe</option>
                            {presets.map(p => <option key={p.id} value={p.recipeName}>{p.recipeName}</option>)}
                        </select>
                        <RefreshCw size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Dose (g)</label>
                    <input type="number" value={dose} onChange={e => setDose(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-center text-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Ratio</label>
                    <div className="w-full h-[48px] flex items-center justify-center text-blue-400 text-lg font-mono bg-slate-900 rounded-xl">
                      1:{dose > 0 ? (totalWater / dose).toFixed(1) : 0}
                    </div>
                  </div>
                </div>
            </div>

            <div className="md:col-span-2 bg-slate-800/30 p-6 rounded-3xl border border-slate-800 space-y-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brewing Parameters</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Grinder</label>
                      <input name="grinder" value={formData.grinder} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Setting</label>
                      <input type="number" name="clicks" value={formData.clicks} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Water Temp</label>
                      <div className="relative">
                        <input type="number" name="waterTemp" value={formData.waterTemp} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-slate-200 text-sm" />
                        <Flame size={14} className="absolute left-4 top-4 text-orange-500" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Total Time</label>
                      <div className="relative">
                        <input name="totalTime" value={formData.totalTime} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-slate-200 text-sm" />
                        <Clock size={14} className="absolute left-4 top-4 text-blue-500" />
                      </div>
                  </div>
               </div>
            </div>
        </div>

        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Droplets size={14} className="text-blue-500" /> Pouring Guide
                </h3>
                <span className="text-sm font-mono text-slate-400">Total: <span className="text-blue-400">{totalWater}g</span></span>
             </div>
             <div className="space-y-3">
                {pourSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-center animate-slide-in">
                    <div className="text-xs font-bold text-slate-600 w-8">#{idx+1}</div>
                    <div className="flex-1 relative">
                       <input value={step.time} onChange={e => updateStep(idx, 'time', e.target.value)} placeholder="0:00" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-sm text-slate-200 font-mono" />
                       <Clock size={12} className="absolute left-4 top-4 text-slate-500" />
                    </div>
                    <div className="flex-1 relative">
                       <input type="number" value={step.amount} onChange={e => updateStep(idx, 'amount', Number(e.target.value))} placeholder="g" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pl-10 text-sm text-slate-200 font-mono" />
                       <Droplets size={12} className="absolute left-4 top-4 text-slate-500" />
                    </div>
                    <button type="button" onClick={() => removeStep(idx)} className="p-3 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button type="button" onClick={addStep} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-sm">
                  <Plus size={16}/> Add Pour Step
                </button>
             </div>
        </div>

        <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Tasting Notes & Review</label>
            <textarea 
                name="tasteReview" 
                value={formData.tasteReview}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 text-slate-200 h-32 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-600"
                placeholder="Describe the experience: acidity, body, sweetness, aftertaste..."
            />
        </div>

        <div className="flex justify-end">
             <button 
                type="submit" 
                disabled={loading}
                className="bg-white hover:bg-slate-200 text-slate-900 px-12 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20} /> Register Brew Record</>}
             </button>
        </div>
      </form>
    </div>
  );
};

export default LogBrewForm;
