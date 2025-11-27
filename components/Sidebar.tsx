import React from 'react';
import { LayoutDashboard, Bot, MessageSquare, Menu, X, Activity } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Smart Dashboard', icon: LayoutDashboard, desc: 'Generate UI from Data' },
    { id: AppView.AUTOMATION, label: 'Automation Lab', icon: Bot, desc: 'Task Processing' },
    { id: AppView.CHAT, label: 'Gemini Chat', icon: MessageSquare, desc: 'Interactive Model' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-30 transition-transform duration-300 w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-cyan-400">
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold text-slate-100 tracking-tight">Gemini Studio</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                ${currentView === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
              `}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'text-cyan-400' : 'group-hover:text-cyan-200'}`} />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-60 font-normal">{item.desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2">Powered by</div>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Gemini 2.5 Flash
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
