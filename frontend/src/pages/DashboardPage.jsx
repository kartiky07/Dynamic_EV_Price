import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Zap, DollarSign, Percent, AlertTriangle, Activity, Database, RefreshCw, Layers, Clock 
} from 'lucide-react';

// High-fidelity fallback data in case backend analytics fetch fails
const mockData = {
  kpis: {
    predicted_demand: 26.85,
    current_tariff: 19.34,
    revenue_gain_percent: 2.16,
    congestion_level: "Medium",
    utilization_score: 54.3,
    total_sessions: 158,
    revenue_gain_val: 1845.20,
    fixed_revenue_total: 10102.50,
    dynamic_revenue_total: 11947.70
  },
  charts: {
    hourly_trends: Array.from({ length: 24 }, (_, h) => {
      const isPeak = (h >= 8 && h <= 11) || (h >= 17 && h <= 20);
      const isNight = h >= 22 || h <= 5;
      const baseDemand = isPeak ? 45 : (isNight ? 12 : 25);
      const randomDemand = baseDemand + Math.sin(h / 3) * 5 + Math.random() * 4;
      const baseTariff = 15.0;
      const dynamicTariff = isPeak ? (baseTariff * 1.45) : (isNight ? (baseTariff * 0.85) : (baseTariff * 1.1));
      const utilization = isPeak ? 85 : (isNight ? 18 : 50);
      return {
        hour: `${String(h).padStart(2, '0')}:00`,
        demand: Math.round(randomDemand * 100) / 100,
        tariff: Math.round(dynamicTariff * 100) / 100,
        utilization: Math.round((utilization + Math.random() * 5) * 10) / 10
      };
    }),
    congestion_dist: [
      { name: "Low Congestion", value: 64, color: "#10b981" },
      { name: "Medium Congestion", value: 58, color: "#0ea5e9" },
      { name: "High Congestion", value: 36, color: "#ef4444" }
    ],
    weekly_revenue: [
      { day: "Monday", "Fixed Pricing": 1240, "Dynamic Pricing": 1420 },
      { day: "Tuesday", "Fixed Pricing": 1350, "Dynamic Pricing": 1580 },
      { day: "Wednesday", "Fixed Pricing": 1410, "Dynamic Pricing": 1690 },
      { day: "Thursday", "Fixed Pricing": 1390, "Dynamic Pricing": 1640 },
      { day: "Friday", "Fixed Pricing": 1550, "Dynamic Pricing": 1880 },
      { day: "Saturday", "Fixed Pricing": 1680, "Dynamic Pricing": 2040 },
      { day: "Sunday", "Fixed Pricing": 1480, "Dynamic Pricing": 1697 }
    ]
  },
  recent_sessions: [
    { id: 158, time: "2026-05-26 12:15:32", hour: 12, kwh: 34.2, strategy: "Normal", congestion: "Medium", tariff: 17.50, gain: 16.67 },
    { id: 157, time: "2026-05-26 11:45:10", hour: 11, kwh: 48.5, strategy: "Surge", congestion: "High", tariff: 22.80, gain: 52.00 },
    { id: 156, time: "2026-05-26 11:10:04", hour: 11, kwh: 12.4, strategy: "Surge", congestion: "High", tariff: 21.60, gain: 44.00 },
    { id: 155, time: "2026-05-26 10:20:45", hour: 10, kwh: 22.1, strategy: "Surge", congestion: "High", tariff: 23.20, gain: 54.67 },
    { id: 154, time: "2026-05-26 09:55:12", hour: 9, kwh: 58.6, strategy: "Surge", congestion: "High", tariff: 24.50, gain: 63.33 },
    { id: 153, time: "2026-05-26 09:12:00", hour: 9, kwh: 18.2, strategy: "Normal", congestion: "Medium", tariff: 16.80, gain: 12.00 },
    { id: 152, time: "2026-05-26 08:34:25", hour: 8, kwh: 8.5, strategy: "Discount", congestion: "Low", tariff: 13.50, gain: -10.00 },
    { id: 151, time: "2026-05-26 07:15:50", hour: 7, kwh: 14.2, strategy: "Discount", congestion: "Low", tariff: 12.80, gain: -14.67 }
  ]
};

export default function DashboardPage({ addNotification }) {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.kpis) {
          setData(json);
          setIsLive(true);
          addNotification("Dashboard data synced with backend API.", "success");
        } else {
          throw new Error("Invalid analytics structure");
        }
      } else {
        throw new Error("Backend response error");
      }
    } catch (err) {
      console.warn("FastAPI offline. Serving high-fidelity local mock data.", err);
      setData(mockData);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const kpis = data.kpis;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Zap className="text-electric-400" size={32} />
            <span>EV Operations Control Panel</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time energy demands, dynamic tariff curves, and station congestions monitored via LightGBM.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-neon-500 animate-ping' : 'bg-red-500'}`} />
            <span className="text-slate-300">{isLive ? 'Connected Live' : 'Demo Database Mode'}</span>
          </div>
          
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-dark-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Card 1 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Demand</span>
            <Activity className="text-electric-400" size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{kpis.predicted_demand} kWh</h3>
            <span className="text-[11px] text-slate-500 font-medium">Predicted per session</span>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Tariff</span>
            <DollarSign className="text-neon-400" size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">₹{kpis.current_tariff}/kWh</h3>
            <span className="text-[11px] text-neon-400 font-medium">Base rate: ₹15.00</span>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue Gain</span>
            <Percent className="text-neon-400" size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">+{kpis.revenue_gain_percent}%</h3>
            <span className="text-[11px] text-slate-500 font-medium">Dynamic vs Flat tariff</span>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Congestion Risk</span>
            <AlertTriangle className={kpis.congestion_level === 'High' ? 'text-red-500' : 'text-amber-500'} size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{kpis.congestion_level}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Station average</span>
          </div>
        </motion.div>

        {/* Card 5 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Utilization</span>
            <Layers className="text-electric-400" size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{kpis.utilization_score}%</h3>
            <span className="text-[11px] text-slate-500 font-medium">Active ports charging</span>
          </div>
        </motion.div>

        {/* Card 6 */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sessions</span>
            <Clock className="text-slate-400" size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{kpis.total_sessions}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Log entries recorded</span>
          </div>
        </motion.div>
      </div>

      {/* Primary Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: EV Demand by Hour (Area) */}
        <div className="glass-panel p-6 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">1. EV Demand by Hour</h3>
            <span className="text-xs text-electric-400 font-semibold">kWh Delivered</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="demand" name="Demand (kWh)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Congestion Distribution (Pie) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">2. Congestion Distribution</h3>
            <span className="text-xs text-slate-400 font-semibold">Session Status</span>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.congestion_dist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.charts.congestion_dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Fixed vs Dynamic Revenue Comparison (Bar) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">3. Fixed vs Dynamic Pricing Revenue</h3>
            <span className="text-xs text-slate-400 font-semibold">Weekly Yield</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.weekly_revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Fixed Pricing" fill="#4b5563" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dynamic Pricing" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Dynamic Tariff Trends (Line) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">4. Dynamic Tariff Trends</h3>
            <span className="text-xs text-slate-400 font-semibold">Average Tariff per Hour</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[10, 26]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="tariff" name="Tariff (₹/kWh)" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tertiary Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Station Utilization (Area) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">5. Station Utilization Profile</h3>
            <span className="text-xs text-slate-400 font-semibold">% Ports Plugged In</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="utilization" name="Utilization %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Revenue Efficiency by Hour (Area) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">6. Pricing Premium Efficiency</h3>
            <span className="text-xs text-slate-400 font-semibold">Dynamic vs Base Premium (₹)</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="tariff" name="Tariff (₹)" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPremium)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sessions Logs */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database size={18} className="text-electric-400" />
          <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase">Recent Charging Logs & Model Outcomes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Hour</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4 text-center">Congestion</th>
                <th className="py-3 px-4 text-center">Strategy</th>
                <th className="py-3 px-4 text-right">Applied Tariff</th>
                <th className="py-3 px-4 text-right">Revenue Shift</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_sessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">#000{session.id}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{session.time}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{String(session.hour).padStart(2, '0')}:00</td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">{session.kwh} kWh</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      session.congestion === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      session.congestion === 'Medium' ? 'bg-electric-500/10 text-electric-400 border border-electric-500/20' : 
                      'bg-neon-500/10 text-neon-400 border border-neon-500/20'
                    }`}>
                      {session.congestion}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      session.strategy === 'Surge' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      session.strategy === 'Normal' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {session.strategy}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-200">₹{session.tariff.toFixed(2)}/kWh</td>
                  <td className={`py-3 px-4 text-right font-bold ${session.gain >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                    {session.gain >= 0 ? '+' : ''}{session.gain.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
