import React, { useState, useRef, useEffect } from 'react';
import { Bean, Brew } from '../types';
import { TrendingUp, Activity, Package, Search, Plus, Sparkles, Coffee } from 'lucide-react';
import FlavorTag from './FlavorTag';
import { COUNTRY_FLAGS } from '../constants';

interface DashboardProps {
  beans: Bean[];
  history: Brew[];
  onSelectBean: (bean: Bean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ beans, history, onSelectBean }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeBeans = beans.filter(b => b.status === 'Active');
  const recentBrews = history.slice(0, 5); 
  const totalSpent = history.reduce((acc, curr) => acc + (curr.calculatedCost || 0), 0);

  // Filter beans for the dropdown
  const filteredBeans = activeBeans.filter(bean => 
    bean.roaster.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bean.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bean.farm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in relative">
      
      {/* Hero / Gemini Style Input */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <h1 className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-8 tracking-tight">
          What are you brewing, Ayden?
        </h1>
        
        <div className="w-full max-w-2xl relative z-20">
            <div 
                className={`
                    relative flex items-center bg-slate-800 rounded-3xl border transition-all duration-300 shadow-2xl
                    ${isFocused ? 'border-purple-500/50 shadow-purple-900/20 ring-1 ring-purple-500/30' : 'border-slate-700'}
                `}
            >
                <div className="pl-5 text-slate-400">
                    <Sparkles size={20} className={isFocused ? "text-purple-400 animate-pulse" : ""} />
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                    placeholder="Search your active beans..."
                    className="w-full bg-transparent border-none text-lg p-5 text-slate-100 focus:ring-0 placeholder-slate-500 outline-none"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="pr-5 text-slate-500 hover:text-white">
                        <Plus size={20} className="rotate-45"/>
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                    {filteredBeans.length > 0 ? (
                        filteredBeans.map(bean => (
                            <button
                                key={bean.id}
                                onClick={() => onSelectBean(bean)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-none transition-colors group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                        {COUNTRY_FLAGS[bean.country] || '☕'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-200">{bean.roaster}</div>
                                        <div className="text-sm text-slate-500">{bean.farm || bean.variety}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-purple-400 font-medium px-3 py-1 bg-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    BREW NOW
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-6 text-center text-slate-500">
                            {activeBeans.length === 0 ? "No active beans in inventory." : "No beans match your search."}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Package size={24}/></div>
                <span className="text-xs text-slate-500 font-medium">INVENTORY</span>
            </div>
            <div className="text-3xl font-semibold text-slate-100">{activeBeans.length}</div>
            <div className="text-sm text-slate-500 mt-1">Active Bags</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={24}/></div>
                <span className="text-xs text-slate-500 font-medium">TOTAL BREWS</span>
            </div>
            <div className="text-3xl font-semibold text-slate-100">{history.length}</div>
            <div className="text-sm text-slate-500 mt-1">Cups Logged</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Activity size={24}/></div>
                <span className="text-xs text-slate-500 font-medium">SPEND</span>
            </div>
            <div className="text-3xl font-semibold text-slate-100">₩{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">Estimated Cost</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
         <h3 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Coffee size={18} />
            Recent Activity
         </h3>
         <div className="space-y-3">
            {recentBrews.map((brew, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
                            {brew.filterType?.[0] || 'V'}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-200">{brew.recipeName}</div>
                            <div className="text-xs text-slate-500">{brew.date} • {brew.grinder}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-emerald-400">₩{brew.calculatedCost?.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">{brew.totalTime}</div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;