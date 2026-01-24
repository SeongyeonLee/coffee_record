import React, { useState } from 'react';
import { Bean } from '../../types';
import { FLAVOR_HIERARCHY, COUNTRY_FLAGS } from '../../constants';
import { Save, X, Sparkles, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { getCoffeeDetails } from '../../services/gemini';

interface AddBeanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddBeanForm: React.FC<AddBeanFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Bean>>({
    country: '',
    region: '',
    farm: '',
    variety: '',
    process: 'Natural',
    altitude: '',
    roaster: '',
    weight: 200,
    price: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    flavorNotes: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const toggleFlavor = (flavor: string) => {
    setFormData(prev => {
      const current = prev.flavorNotes || [];
      if (current.includes(flavor)) {
        return { ...prev, flavorNotes: current.filter(f => f !== flavor) };
      }
      if (current.length >= 6) return prev;
      return { ...prev, flavorNotes: [...current, flavor] };
    });
  };

  const handleAiAutofill = async () => {
    if (!formData.roaster) {
        alert("Please enter a Roaster name first.");
        return;
    }
    setAiLoading(true);
    try {
        const beanQuery = formData.farm || formData.variety || "Coffee";
        const info = await getCoffeeDetails(formData.roaster, beanQuery);
        if (info) {
            setFormData(prev => ({
                ...prev,
                country: info.country || prev.country,
                region: info.region || prev.region,
                farm: info.farm || prev.farm,
                variety: info.variety || prev.variety,
                process: info.process || prev.process,
                altitude: info.altitude ? String(info.altitude) : prev.altitude,
                flavorNotes: info.flavorNotes && info.flavorNotes.length > 0 ? info.flavorNotes.slice(0, 6) : prev.flavorNotes
            }));
        }
    } catch (e) {
        console.error(e);
        alert("AI search failed.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addBean(formData as Omit<Bean, 'id'>);
      onSuccess();
    } catch (error) {
      alert('Failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-light text-slate-100">Add New Bean</h2>
          <p className="text-slate-500 mt-1">Populate your inventory with new specialty coffees.</p>
        </div>
        <button onClick={onCancel} className="p-3 bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
             <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Origin & Roaster</h3>
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Roaster Name</label>
                  <input required name="roaster" value={formData.roaster} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-blue-500 outline-none" />
               </div>
               <button 
                  type="button"
                  onClick={handleAiAutofill}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 hover:from-indigo-900 hover:to-purple-900 border border-indigo-700 text-indigo-100 py-3 rounded-xl text-sm font-medium transition-all"
               >
                  {aiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                  Auto-fill with AI
               </button>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Country</label>
                    <input required list="countries" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Region</label>
                    <input name="region" value={formData.region} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-blue-500 outline-none" />
                  </div>
               </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 space-y-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Technical Specs</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Variety</label>
                    <input name="variety" value={formData.variety} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Process</label>
                    <select name="process" value={formData.process} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200">
                        {['Natural', 'Washed', 'Honey', 'Anaerobic', 'Experimental'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Weight (g)</label>
                    <input type="number" required name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Price (₩)</label>
                    <input type="number" required name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200" />
                </div>
               </div>
             </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Flavor Profile Selection</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {formData.flavorNotes?.map(note => (
                <span key={note} onClick={() => toggleFlavor(note)} className="bg-blue-600/30 text-blue-300 text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-all">
                  {note} ×
                </span>
              ))}
              {formData.flavorNotes?.length === 0 && <span className="text-sm text-slate-600 italic">No flavors selected.</span>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(FLAVOR_HIERARCHY).map(category => {
                const isActive = activeCategory === category;
                return (
                  <div key={category} className="space-y-2">
                    <button 
                      type="button"
                      onClick={() => setActiveCategory(isActive ? null : category)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                    >
                      <span className="text-sm font-medium">{category}</span>
                      {isActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {isActive && (
                      <div className="grid grid-cols-1 gap-1.5 p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
                        {FLAVOR_HIERARCHY[category].map(note => {
                          const isSelected = formData.flavorNotes?.includes(note);
                          return (
                            <button
                              key={note}
                              type="button"
                              onClick={() => toggleFlavor(note)}
                              className={`text-left p-2.5 rounded-xl text-xs transition-colors ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                            >
                              {note}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>

        <div className="pt-10 flex justify-end">
             <button 
                type="submit" 
                disabled={loading}
                className="bg-white hover:bg-slate-200 text-slate-900 px-12 py-4 rounded-2xl font-bold transition-all shadow-xl"
             >
                {loading ? 'Registering...' : 'Complete Registration'}
             </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeanForm;
