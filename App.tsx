import { useState, useEffect, JSX } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddBeanForm from './components/forms/AddBeanForm';
import LogBrewForm from './components/forms/LogBrewForm';
import CafeLogBook from './components/CafeLogBook';
import BeanArchive from './components/BeanArchive';
import BrewHistory from './components/BrewHistory';
import PresetManager from './components/PresetManager';
import { Bean, Brew, CafeLog, AppView, Preset, PourStep } from './types';
import { api } from './services/api';
import { Loader2, WifiOff, RefreshCw, Coffee, X, Clock, Droplets } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedData, setSelectedData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [beans, setBeans] = useState<Bean[]>([]);
  const [history, setHistory] = useState<Brew[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [cafeLogs, setCafeLogs] = useState<CafeLog[]>([]);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedBeans, fetchedHistory, fetchedCafeLogs, fetchedPresets] = await Promise.all([
        api.getBeans(),
        api.getHistory(),
        api.getCafeLogs(),
        api.getPresets()
      ]);
      setBeans(fetchedBeans);
      setHistory(fetchedHistory);
      setCafeLogs(fetchedCafeLogs);
      setPresets(fetchedPresets);
    } catch (e: any) {
      console.error("Failed to load data", e);
      setError(e.message || "Failed to connect to the coffee database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBean = (bean: Bean) => {
    setSelectedBean(bean);
    setActiveView(AppView.LOG_BREW);
  };

  const handleNavigate = (view: AppView, data?: any) => {
    setActiveView(view);
    setSelectedData(data || null);
    if (view !== AppView.LOG_BREW) {
        setSelectedBean(null);
    }
  };

  const renderContent = (): JSX.Element | null => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
          <div className="relative mb-8">
            <Coffee size={64} className="text-slate-700" />
            <Loader2 size={32} className="absolute -bottom-2 -right-2 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-xl font-light text-slate-400">Brewing your journal...</h2>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-slate-800/20 border border-slate-800 rounded-[3rem] animate-fade-in">
          <WifiOff size={48} className="text-red-400 mb-6" />
          <h1 className="text-2xl font-light text-slate-100 mb-4">Connection Failed</h1>
          <p className="text-slate-500 mb-8 max-w-sm">{error}</p>
          <button onClick={() => { fetchData(); }} className="flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      );
    }

    switch (activeView) {
      case AppView.ADD_BEAN:
        return <AddBeanForm onSuccess={() => { fetchData(); setActiveView(AppView.DASHBOARD); }} onCancel={() => setActiveView(AppView.DASHBOARD)} />;
      case AppView.LOG_BREW:
        if (!selectedBean) return <div className="text-center mt-20 text-slate-500">Select a bean to start.</div>;
        return <LogBrewForm selectedBean={selectedBean} onSuccess={() => { fetchData(); setActiveView(AppView.DASHBOARD); }} />;
      case AppView.CAFE_LOG:
        return <CafeLogBook logs={cafeLogs} onRefresh={() => { fetchData(); }} />;
      case AppView.BEAN_ARCHIVE:
        return <BeanArchive beans={beans} onRefresh={() => { fetchData(); }} onBrew={handleSelectBean} onNavigate={handleNavigate} />;
      case AppView.BREW_HISTORY:
        return <BrewHistory history={history} beans={beans} onRefresh={() => { fetchData(); }} />;
      case AppView.PRESET_MANAGER:
        return <PresetManager presets={presets} onRefresh={() => { fetchData(); }} />;
      case AppView.BREW_DETAIL:
        const brew = selectedData as Brew;
        if (!brew) return null;
        let steps: PourStep[] = [];
        try { steps = JSON.parse(brew.pourSteps); } catch(e) {}
        return (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <button onClick={() => setActiveView(AppView.BREW_HISTORY)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                 <h2 className="text-2xl font-light text-slate-100">Brew Activity Detail</h2>
               </div>
               <span className="text-sm font-mono text-slate-500">{brew.date}</span>
             </div>

             <div className="bg-slate-800/50 border border-slate-700 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-light text-emerald-400 mb-2">{brew.recipeName}</h3>
                    <p className="text-slate-400 text-lg">{beans.find(b => b.id === brew.beanId)?.roaster || 'Unknown Bean'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono text-white">₩{(brew.calculatedCost || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Cost per Cup</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Grinder</div>
                      <div className="text-slate-200">{brew.grinder} • {brew.clicks}</div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Dripper</div>
                      <div className="text-slate-200">{brew.dripper}</div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Temp</div>
                      <div className="text-slate-200">{brew.waterTemp}°C</div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Time</div>
                      <div className="text-slate-200">{brew.totalTime}</div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Droplets size={14} className="text-blue-500" /> Pour Sequence
                   </h4>
                   <div className="grid grid-cols-1 gap-2">
                      {steps.map((step, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-900/30 px-6 py-3 rounded-xl border border-slate-800/50">
                           <div className="flex items-center gap-3 text-slate-400">
                              <Clock size={14} className="text-slate-600" />
                              <span className="font-mono text-sm">{step.time}</span>
                           </div>
                           <div className="font-mono text-slate-200">{step.amount}g</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Tasting Notes</h4>
                   <p className="text-slate-300 italic leading-relaxed">
                      "{brew.tasteReview || 'No specific notes recorded.'}"
                   </p>
                </div>
             </div>
          </div>
        );
      case AppView.DASHBOARD:
      default:
        return <Dashboard beans={beans} history={history} onSelectBean={handleSelectBean} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-200 font-sans overflow-x-hidden">
      <Sidebar 
        beans={beans} 
        onSelectBean={handleSelectBean} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-16'} p-6 md:p-12 min-h-screen`}>
        <div className="max-w-6xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;