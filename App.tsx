import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddBeanForm from './components/forms/AddBeanForm';
import LogBrewForm from './components/forms/LogBrewForm';
import CafeLogBook from './components/CafeLogBook';
import BeanArchive from './components/BeanArchive';
import BrewHistory from './components/BrewHistory';
import PresetManager from './components/PresetManager';
import { Bean, Brew, CafeLog, AppView, Preset } from './types';
import { api } from './services/api';
import { Loader2, WifiOff, RefreshCw, Coffee } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  
  // App-wide Status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [beans, setBeans] = useState<Bean[]>([]);
  const [history, setHistory] = useState<Brew[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [cafeLogs, setCafeLogs] = useState<CafeLog[]>([]);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      setError(e.message || "An unexpected error occurred while connecting to the journal database.");
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
    if (view !== AppView.LOG_BREW) {
        setSelectedBean(null);
    }
  };

  const renderContent = () => {
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
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <WifiOff size={40} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-light text-slate-100 mb-4">Connection Error</h1>
          <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            {error}
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={fetchData}
              className="flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-xl"
            >
              <RefreshCw size={20} />
              Retry Connection
            </button>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
              Tip: Verify your Google Apps Script is deployed for "Anyone" and the API URL is correct.
            </p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case AppView.ADD_BEAN:
        return <AddBeanForm onSuccess={() => { fetchData(); setActiveView(AppView.DASHBOARD); }} onCancel={() => setActiveView(AppView.DASHBOARD)} />;
      case AppView.LOG_BREW:
        if (!selectedBean) return <div className="text-center mt-20 text-slate-500">Select a bean to start brewing.</div>;
        return <LogBrewForm selectedBean={selectedBean} onSuccess={() => { fetchData(); setActiveView(AppView.DASHBOARD); }} />;
      case AppView.CAFE_LOG:
        return <CafeLogBook logs={cafeLogs} onRefresh={fetchData} />;
      case AppView.BEAN_ARCHIVE:
        return <BeanArchive beans={beans} onRefresh={fetchData} onBrew={handleSelectBean} onNavigate={handleNavigate} />;
      case AppView.BREW_HISTORY:
        return <BrewHistory history={history} beans={beans} onRefresh={fetchData} />;
      case AppView.PRESET_MANAGER:
        return <PresetManager presets={presets} onRefresh={fetchData} />;
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
      
      <main 
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-16'} p-6 md:p-12 min-h-screen relative`}
      >
        <div className="max-w-6xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
