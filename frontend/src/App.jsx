import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, LayoutDashboard, Sparkles, Sliders, Activity, Info, Menu, X, Bell, User, ChevronRight, Zap
} from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import PricingSimulator from './pages/PricingSimulator';
import MonitoringPage from './pages/MonitoringPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [page, setPage] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const menuItems = [
    { id: 'landing', label: 'Welcome Portal', icon: Home },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'prediction', label: 'Demand Predictor', icon: Sparkles },
    { id: 'simulator', label: 'Pricing Sandbox', icon: Sliders },
    { id: 'monitoring', label: 'AI Monitor Agent', icon: Activity },
    { id: 'about', label: 'Technical Specs', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex font-sans text-slate-200">
      
      {/* Toast Notification Tray */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto backdrop-blur-md ${
                toast.type === 'success' ? 'bg-neon-600/90 border-neon-500 text-white' :
                toast.type === 'warning' ? 'bg-amber-600/90 border-amber-500 text-white' :
                'bg-dark-900/90 border-slate-800 text-slate-100'
              }`}
            >
              <Zap size={18} className="shrink-0 mt-0.5 animate-pulse" />
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-900 bg-dark-900/80 backdrop-blur-xl transition-all duration-300 relative z-25 shrink-0 ${
          sidebarCollapsed ? 'w-[78px]' : 'w-[260px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-900 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-electric-500 flex items-center justify-center text-white shadow-lg shadow-electric-500/20">
              <Zap size={18} className="fill-current" />
            </div>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-sm tracking-wide text-white uppercase"
              >
                SocBiz Volt
              </motion.span>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/40"
          >
            <ChevronRight size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-electric-500 text-white font-bold shadow-lg shadow-electric-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-250'} />
                {!sidebarCollapsed && <span className="text-xs tracking-wider">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile banner */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">Station Operator</p>
              <p className="text-[10px] text-slate-500 truncate">Admin Portal</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header & Nav Drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-900 bg-dark-900/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center text-white">
            <Zap size={16} className="fill-current" />
          </div>
          <span className="font-extrabold text-sm text-white uppercase tracking-wider">SocBiz Volt</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 p-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-[270px] bg-dark-900 border-r border-slate-850 p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center text-white">
                    <Zap size={16} />
                  </div>
                  <span className="font-extrabold text-sm tracking-wider uppercase text-white">SocBiz Volt</span>
                </div>
                
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = page === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-electric-500 text-white font-bold' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-850">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Station Operator</p>
                  <p className="text-[10px] text-slate-500">Admin Portal</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-dark-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span>EV STATIONS SYSTEM</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-electric-400 uppercase tracking-widest font-extrabold">{page} page</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-200 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50 relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-200">Kartik Yadav</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold font-mono">Operator ID #8804</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-dark-950/20 relative z-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {page === 'landing' && <LandingPage setPage={setPage} />}
              {page === 'dashboard' && <DashboardPage addNotification={addNotification} />}
              {page === 'prediction' && <PredictionPage addNotification={addNotification} />}
              {page === 'simulator' && <PricingSimulator addNotification={addNotification} />}
              {page === 'monitoring' && <MonitoringPage addNotification={addNotification} />}
              {page === 'about' && <AboutPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
