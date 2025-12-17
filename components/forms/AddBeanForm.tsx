import React, { useState } from 'react';
import { Bean } from '../../types';
import { COMMON_FLAVORS, COUNTRY_FLAGS, FLAVOR_COLORS } from '../../constants';
import { Save, X, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { getCoffeeDetails } from '../../services/gemini';

interface AddBeanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddBeanForm: React.FC<AddBeanFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFlavor = (flavor: string) => {
    setFormData(prev => {
      const current = prev.flavorNotes || [];
      if (current.includes(flavor)) {
        return { ...prev, flavorNotes: current.filter(f => f !== flavor) };
      }
      if (current.length >= 3) return prev; // Max 3
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
        // Use farm or variety as the 'bean name' for search if farm is empty, 
        // but typically user might type "Onyx Geometry" in roaster/farm combo.
        // Let's assume user puts the bean name in 'Farm/Station' or we just search generally.
        // For better UX, let's look at what we have.
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
                altitude: info.altitude || prev.altitude,
                flavorNotes: info.flavorNotes && info.flavorNotes.length > 0 ? info.flavorNotes.slice(0, 3) : prev.flavorNotes
            }));
        }
    } catch (e) {
        console.error(e);
        alert("Could not auto-fill details. Please try manually.");
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
      alert('Failed to add bean: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light text-slate-100">Add New Bean</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={24}/></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
          {/* Roaster Info */}
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Roaster Name</label>
                <input required name="roaster" value={formData.roaster} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Onyx Coffee Lab" />
             </div>

             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bean Name / Farm</label>
                 <div className="relative">
                    <input name="farm" value={formData.farm} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pr-10 text-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Geometry or Halo Beriti" />
                </div>
             </div>
             
             {/* AI Button */}
             <button 
                type="button"
                onClick={handleAiAutofill}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 border border-indigo-700 text-indigo-100 py-2 rounded-lg text-sm font-medium transition-all"
             >
                {aiLoading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
                {aiLoading ? "Searching Web..." : "Auto-fill Details with AI"}
             </button>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Country</label>
                   <input required list="countries" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" placeholder="Type..." />
                   <datalist id="countries">
                     {Object.keys(COUNTRY_FLAGS).filter(c => c !== 'Unknown').map(c => (
                        <option key={c} value={c} />
                     ))}
                   </datalist>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Region</label>
                   <input name="region" value={formData.region} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Yirgacheffe" />
                </div>
             </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Variety</label>
                    <input name="variety" value={formData.variety} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. Gesha" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Process</label>
                    <select name="process" value={formData.process} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none">
                        <option value="Natural">Natural</option>
                        <option value="Washed">Washed</option>
                        <option value="Honey">Honey</option>
                        <option value="Anaerobic">Anaerobic</option>
                        <option value="Experimental">Experimental</option>
                    </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Altitude (masl)</label>
                    <input name="altitude" value={formData.altitude} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" placeholder="e.g. 2000" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Date</label>
                    <input type="date" required name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" />
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Total Weight (g)</label>
                    <input type="number" required name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Price (₩)</label>
                    <input type="number" required name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-blue-500 outline-none" />
                </div>
             </div>
          </div>
        </div>

        {/* Flavor Wheel Selection */}
        <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-400 mb-3">Flavor Profile (Max 3)</label>
            <div className="flex flex-wrap gap-2">
                {/* Custom Flavors from AI or Input */}
                {formData.flavorNotes && formData.flavorNotes.map(flavor => {
                    // If it's not in common flavors, render it specially
                    if(!COMMON_FLAVORS.includes(flavor)) {
                         return (
                            <button
                                key={flavor}
                                type="button"
                                onClick={() => toggleFlavor(flavor)}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md ring-1 ring-white/20"
                            >
                                {flavor} <span className="opacity-70 ml-1">×</span>
                            </button>
                         )
                    }
                    return null;
                })}

                {/* Common Flavors */}
                {COMMON_FLAVORS.map(flavor => {
                    const isSelected = formData.flavorNotes?.includes(flavor);
                    const colorClass = FLAVOR_COLORS[flavor] || 'from-gray-600 to-gray-700';
                    return (
                        <button
                            key={flavor}
                            type="button"
                            onClick={() => toggleFlavor(flavor)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                ? `bg-gradient-to-r ${colorClass} text-white shadow-md ring-1 ring-white/20` 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {flavor}
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="pt-6 flex justify-end">
             <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
             >
                {loading ? 'Saving...' : <><Save size={18}/> Save to Inventory</>}
             </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeanForm;