import React, { useState, useMemo } from 'react';
import { Plus, Coffee, Search, Menu, ChevronLeft, MapPin } from 'lucide-react';
import { Bean, AppView } from '../types';
import { COUNTRY_FLAGS } from '../constants';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface SidebarProps {
  beans: Bean[];
  onSelectBean: (bean: Bean) => void;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeView: AppView;
}

const Sidebar: React.FC<SidebarProps> = ({ beans, onSelectBean, onNavigate, isOpen, setIsOpen, activeView }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBeans = useMemo(() => {
    return beans.filter(bean => 
      bean.status === 'Active' && 
      (bean.roaster.toLowerCase().includes(searchTerm.toLowerCase()) || 
       bean.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bean.variety.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [beans, searchTerm]);

  const getFlag = (country: string) => COUNTRY_FLAGS[country] || COUNTRY_FLAGS['Unknown'];

  const getDaysSinceRoast = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const diffTime = Math.abs(new Date().getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return `D+${diffDays}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-20 flex flex-col
        ${isOpen ? 'w-80' : 'w-16'}
      `}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white transition-colors">
            {isOpen ? <Menu size={24} /> : <Menu size={24} />}
        </button>
        {isOpen && (
          <button 
            onClick={() => onNavigate(AppView.ADD_BEAN)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 px-3 py-1.5 rounded-full transition-all border border-slate-700"
          >
            <Plus size={16} />
            <span>New Bean</span>
          </button>
        )}
      </div>

      {/* Main Nav Items (collapsed/expanded) */}
      <div className="flex flex-col gap-1 px-2 mb-4">
         <button 
            onClick={() => onNavigate(AppView.DASHBOARD)}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${activeView === AppView.DASHBOARD ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title="Dashboard"
         >
            <div className="min-w-[24px]"><Coffee size={24} /></div>
            {isOpen && <span className="font-medium">Dashboard</span>}
         </button>
         
         <button 
            onClick={() => onNavigate(AppView.CAFE_LOG)}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${activeView === AppView.CAFE_LOG ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title="Cafe Logs"
         >
             <div className="min-w-[24px]"><MapPin size={24} /></div>
             {isOpen && <span className="font-medium">Cafe Logs</span>}
         </button>
      </div>

      {/* Bean List Section */}
      {isOpen ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Beans</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search beans..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-slate-500 placeholder-slate-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
            {filteredBeans.length === 0 ? (
                <div className="text-center text-slate-600 text-sm mt-4">No active beans found.</div>
            ) : (
                filteredBeans.map(bean => (
                <div 
                    key={bean.id}
                    onClick={() => onSelectBean(bean)}
                    className="group p-3 rounded-lg hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 transition-all"
                >
                    <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-200 text-sm line-clamp-1">{bean.roaster}</span>
                    <span className="text-xs text-slate-500 font-mono">{getDaysSinceRoast(bean.purchaseDate)}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>{getFlag(bean.country)}</span>
                    <span className="truncate">{bean.variety}</span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-4 mt-4">
            <div className="w-8 h-px bg-slate-800"></div>
        </div>
      )}
      
      {/* User / Footer */}
      <div className="p-4 border-t border-slate-800">
         <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
                AY
            </div>
            {isOpen && (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">Ayden</span>
                    <span className="text-xs text-slate-500">Coffee Enthusiast</span>
                </div>
            )}
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;