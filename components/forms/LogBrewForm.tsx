import React, { useState, useEffect } from 'react';
import { Bean, Brew, Preset } from '../../types';
import { api } from '../../services/api';
import { Clock, Droplets, Save, RefreshCw, Flame } from 'lucide-react';

interface LogBrewFormProps {
  selectedBean: Bean;
  onSuccess: () => void;
}

const LogBrewForm: React.FC<LogBrewFormProps> = ({ selectedBean, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [cost, setCost] = useState<number>(0);
  
  const [formData, setFormData] = useState<Partial<Brew>>({
    beanId: selectedBean.id,
    date: new Date().toISOString().split('T')[0],
    recipeName: 'V60 Standard',
    grinder: 'Comandante',
    clicks: 20,
    dripper: 'V60',
    filterType: 'Paper',
    waterTemp: 93,
    pourSteps: '0:00-50g, 0:45-150g, 1:30-250g',
    totalTime: '2:30',
    tasteReview: '',
    calculatedCost: 0,
  });
  
  // Quick inputs for calculation (not stored directly in DB except as logic)
  const [dose, setDose] = useState<number>(15);
  const [water, setWater] = useState<number>(250);

  useEffect(() => {
    // Load presets on mount
    api.getPresets().then(setPresets).catch(console.error);
  }, []);

  useEffect(() => {
    // Calculate cost in real-time
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
        pourSteps: preset.pourSteps
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addBrew(formData as Brew);
      onSuccess();
    } catch (error) {
      alert('Failed to log brew');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-xl text-slate-200">Log Brew</h2>
           <p className="text-slate-500 text-sm mt-1">
             Using <span className="text-blue-400 font-medium">{selectedBean.roaster} - {selectedBean.variety}</span>
           </p>
        </div>
        <div className="text-right">
            <span className="block text-xs text-slate-500 uppercase tracking-wide">Estimated Cost</span>
            <span className="text-2xl font-light text-emerald-400">₩{cost.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Row: Preset & Dose */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-400 mb-1">Load Preset</label>
                <div className="relative">
                    <select onChange={loadPreset} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 appearance-none outline-none">
                        <option value="">Custom Recipe</option>
                        {presets.map(p => <option key={p.recipeName} value={p.recipeName}>{p.recipeName}</option>)}
                    </select>
                    <RefreshCw size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-3 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Dose (g)</label>
                   <input type="number" value={dose} onChange={e => setDose(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-slate-200 font-mono" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Water (g)</label>
                   <input type="number" value={water} onChange={e => setWater(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-slate-200 font-mono" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Ratio</label>
                   <div className="w-full h-[42px] flex items-center justify-center text-slate-500 text-sm font-mono">
                      1:{Math.round(water/dose)}
                   </div>
                </div>
            </div>
        </div>

        {/* Detailed Params */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Grinder</label>
                <input name="grinder" value={formData.grinder} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Clicks/Setting</label>
                <input type="number" name="clicks" value={formData.clicks} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Temperature</label>
                <div className="relative">
                   <input type="number" name="waterTemp" value={formData.waterTemp} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-8 text-slate-200 text-sm" />
                   <Flame size={14} className="absolute left-2.5 top-2.5 text-orange-500" />
                </div>
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Total Time</label>
                <div className="relative">
                   <input name="totalTime" value={formData.totalTime} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-8 text-slate-200 text-sm" placeholder="2:30" />
                   <Clock size={14} className="absolute left-2.5 top-2.5 text-blue-500" />
                </div>
             </div>
        </div>

        {/* Pour Steps */}
        <div>
             <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                <Droplets size={14} /> Pour Structure
             </label>
             <input 
                name="pourSteps" 
                value={formData.pourSteps} 
                onChange={handleInputChange} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-sm placeholder-slate-600"
                placeholder="e.g. 0:00-50g, 0:45-150g, 1:30-250g" 
             />
        </div>

        {/* Review */}
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Taste Notes & Review</label>
            <textarea 
                name="tasteReview" 
                value={formData.tasteReview}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 h-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Balanced acidity, sweet finish..."
            />
        </div>

        <div className="flex justify-end pt-4">
             <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
             >
                {loading ? 'Brewing...' : <><Save size={18} /> Log Brew</>}
             </button>
        </div>
      </form>
    </div>
  );
};

export default LogBrewForm;