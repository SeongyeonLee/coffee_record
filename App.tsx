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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  
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
    } catch (e) {
      console.error("Failed to load data", e);
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
        return <BrewHistory history={history} beans={beans} />;
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
        <div className="max-w-5xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
