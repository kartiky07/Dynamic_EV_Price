import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldAlert, Cpu, Heart, CheckCircle2, RefreshCw, AlertTriangle, 
  Lightbulb, ShieldCheck, ArrowRight, Zap 
} from 'lucide-react';

const mockMonitoringData = {
  alerts: [
    {
      id: "alert_1",
      type: "warning",
      title: "Grid Demand Surge Warning",
      message: "High congestion levels detected across multiple charger clusters. Surge pricing activated at 12 active ports.",
      timestamp: "Just Now"
    },
    {
      id: "alert_2",
      type: "anomaly",
      title: "High Idle Ratio Detected",
      message: "EVs remain parked long after charging completed. Station turnaround efficiency degraded by 12%. Consider increasing idle-time surcharges.",
      timestamp: "1 hour ago"
    },
    {
      id: "alert_3",
      type: "success",
      title: "Off-Peak Discount Stimulus Success",
      message: "Night discounting of -15% increased off-peak utilization by 18.2% over the last 24 hours.",
      timestamp: "3 hours ago"
    }
  ],
  recommendations: [
    {
      id: "rec_1",
      category: "Pricing Strategy",
      suggestion: "Adjust peak pricing window from 17:00-20:00 to 16:30-20:30 based on early congestion buildup.",
      impact: "Improves grid load stability by 4.2%",
      urgency: "Medium"
    },
    {
      id: "rec_2",
      category: "Infrastructure Optimization",
      suggestion: "High idle ratios found during off-peak periods (42% average). Implement an idle-time surcharge of ₹5/min after a 15-minute grace period.",
      impact: "Increases charger turnover by 22%",
      urgency: "High"
    },
    {
      id: "rec_3",
      category: "Revenue Optimization",
      suggestion: "Off-peak discounting stimulated demand. Deepen night charging discount (23:00 to 05:00) by another 5% to attract commercial fleet operators.",
      impact: "Boosts night utilization by 15.6%; Revenue gains average +2.16%",
      urgency: "Low"
    }
  ],
  system_health: {
    model_loaded: true,
    db_connection: "Healthy",
    api_latency: "Optimal (12ms)",
    charging_points_active: 18,
    grid_connection_load: "High Load"
  }
};

export default function MonitoringPage({ addNotification }) {
  const [monitorData, setMonitorData] = useState(mockMonitoringData);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/monitoring');
      if (res.ok) {
        const json = await res.json();
        if (json.alerts) {
          setMonitorData(json);
          setIsLive(true);
          addNotification("AI operational agent logs synchronized.", "success");
        } else {
          throw new Error("Invalid structure");
        }
      } else {
        throw new Error("Endpoint failed");
      }
    } catch (err) {
      console.warn("FastAPI offline. Serving client AI agent logs.", err);
      setMonitorData(mockMonitoringData);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Cpu className="text-electric-400 animate-pulse" size={32} />
            <span>AI Operations & Monitoring Agent</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous audit logs, anomaly detection, grid load warnings, and revenue recommendations generated in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchMonitoringData}
            disabled={loading}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-dark-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Alerts & System Health */}
        <div className="lg:col-span-7 space-y-6">
          {/* System Health Panel */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Activity className="text-electric-400" size={16} />
              <span>System Health & Integrations</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-dark-950/50 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">ML Model Loading</span>
                <span className="font-bold text-neon-400 mt-1 block flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Loaded
                </span>
              </div>
              <div className="bg-dark-950/50 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Database Link</span>
                <span className={`font-bold mt-1 block flex items-center gap-1 ${isLive ? 'text-neon-400' : 'text-orange-400'}`}>
                  <ShieldCheck size={14} />
                  {isLive ? 'SQLite Active' : 'Sandbox DB'}
                </span>
              </div>
              <div className="bg-dark-950/50 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">API Latency</span>
                <span className="font-bold text-neon-400 mt-1 block flex items-center gap-1">
                  <Heart size={14} />
                  {monitorData.system_health.api_latency || '12ms'}
                </span>
              </div>
              <div className="bg-dark-950/50 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Active EV Plugs</span>
                <span className="font-bold text-slate-200 mt-1 block font-mono">
                  {monitorData.system_health.charging_points_active}/20 Chargers
                </span>
              </div>
              <div className="bg-dark-950/50 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Grid Load Profile</span>
                <span className="font-bold text-amber-500 mt-1 block uppercase">
                  {monitorData.system_health.grid_connection_load}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Alerts feed */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={16} />
              <span>Grid Alerts & Anomalies</span>
            </h3>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {monitorData.alerts.map((alert) => (
                <motion.div 
                  key={alert.id}
                  variants={itemVariants}
                  className={`p-4 rounded-xl border flex gap-4 items-start ${
                    alert.type === 'warning' ? 'border-red-500/30 bg-red-500/5 text-red-200' :
                    alert.type === 'anomaly' ? 'border-amber-500/30 bg-amber-500/5 text-amber-200' :
                    'border-neon-500/30 bg-neon-500/5 text-neon-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {alert.type === 'warning' && <ShieldAlert size={20} className="text-red-400" />}
                    {alert.type === 'anomaly' && <AlertTriangle size={20} className="text-amber-400" />}
                    {alert.type === 'success' && <CheckCircle2 size={20} className="text-neon-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold">{alert.title}</h4>
                      <span className="text-[10px] text-slate-500 font-medium font-mono">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lightbulb className="text-amber-500 animate-pulse" size={16} />
              <span>AI Agent Strategies</span>
            </h3>

            <div className="space-y-4">
              {monitorData.recommendations.map((rec) => (
                <div key={rec.id} className="bg-dark-950/40 border border-slate-850 p-4 rounded-xl space-y-3 relative overflow-hidden">
                  {/* Category tag */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-electric-400 uppercase tracking-widest">{rec.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                      rec.urgency === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      rec.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-850 text-slate-400 border-slate-800'
                    }`}>
                      {rec.urgency} Urgency
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    {rec.suggestion}
                  </p>

                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Expected Gain:</span>
                    <span className="font-bold text-neon-400 flex items-center gap-1">
                      <Zap size={10} />
                      {rec.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
