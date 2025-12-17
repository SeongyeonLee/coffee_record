import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddBeanForm from './components/forms/AddBeanForm';
import LogBrewForm from './components/forms/LogBrewForm';
import CafeLogBook from './components/CafeLogBook';
import { Bean, Brew, CafeLog, AppView } from './types';
import { api } from './services/api';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  
  // Data State
  const [beans, setBeans] = useState<Bean[]>([]);
  const [history, setHistory] = useState<Brew[]>([]);
  const [cafeLogs, setCafeLogs] = useState<CafeLog[]>([]);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedBeans, fetchedHistory, fetchedCafeLogs] = await Promise.all([
        api.getBeans(),
        api.getHistory(),
        api.getCafeLogs()
      ]);
      setBeans(fetchedBeans);
      setHistory(fetchedHistory);
      setCafeLogs(fetchedCafeLogs);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const handleSelectBean = (bean: Bean) => {
    setSelectedBean(bean);
    setActiveView(AppView.LOG_BREW);
  };

  const handleNavigate = (view: AppView) => {
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
        if (!selectedBean) return <div className="text-center mt-20 text-slate-500">Select a bean from the sidebar to start brewing.</div>;
        return <LogBrewForm selectedBean={selectedBean} onSuccess={() => { fetchData(); setActiveView(AppView.DASHBOARD); }} />;
      case AppView.CAFE_LOG:
        return <CafeLogBook logs={cafeLogs} onRefresh={fetchData} />;
      case AppView.DASHBOARD:
      default:
        return <Dashboard beans={beans} history={history} onSelectBean={handleSelectBean} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-200 font-sans">
      <Sidebar 
        beans={beans} 
        onSelectBean={handleSelectBean} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
      />
      
      <main 
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-16'} p-6 md:p-12`}
      >
        <div className="max-w-5xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;