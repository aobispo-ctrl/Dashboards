import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardBuilder from './components/DashboardBuilder';
import AutomationLab from './components/AutomationLab';
import Playground from './components/Playground';
import { AppView } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <DashboardBuilder />;
      case AppView.AUTOMATION:
        return <AutomationLab />;
      case AppView.CHAT:
        return <Playground />;
      default:
        return <DashboardBuilder />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="md:pl-72 min-h-screen flex flex-col transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="font-bold text-lg text-white">Gemini Studio</div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-x-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
