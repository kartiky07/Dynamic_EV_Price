import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, Sparkles, CheckCircle, TrendingUp, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function PredictionPage({ addNotification }) {
  // Input states
  const [hour, setHour] = useState(14);
  const [month, setMonth] = useState(5);
  const [dayOfWeek, setDayOfWeek] = useState(1); // Tuesday
  const [sessionDuration, setSessionDuration] = useState(5.0);
  const [chargingDuration, setChargingDuration] = useState(3.0);
  
  // Auto-calculated derived states with overrides
  const [isWeekend, setIsWeekend] = useState(0);
  const [peakHour, setPeakHour] = useState(0);
  const [nightCharging, setNightCharging] = useState(0);
  
  // Auto-calculations when base inputs change
  useEffect(() => {
    // 1. Weekend calculation
    setIsWeekend(dayOfWeek >= 5 ? 1 : 0);
    
    // 2. Peak Hour: 8-11 AM and 5-9 PM
    const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
    setPeakHour(isPeak ? 1 : 0);
    
    // 3. Night Charging: 10 PM to 6 AM
    const isNight = hour >= 22 || hour <= 5;
    setNightCharging(isNight ? 1 : 0);
  }, [hour, dayOfWeek]);

  // Ensure charging duration does not exceed session duration
  useEffect(() => {
    if (chargingDuration > sessionDuration) {
      setChargingDuration(sessionDuration);
    }
  }, [sessionDuration]);

  const idleTime = Math.max(0, Math.round((sessionDuration - chargingDuration) * 100) / 100);
  const idleRatio = sessionDuration > 0 ? Math.round((idleTime / sessionDuration) * 10000) / 10000 : 0;

  // Prediction output states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      Hour: parseInt(hour),
      Month: parseInt(month),
      DayOfWeek: parseInt(dayOfWeek),
      IsWeekend: parseInt(isWeekend),
      PeakHour: parseInt(peakHour),
      NightCharging: parseInt(nightCharging),
      SessionDuration: parseFloat(sessionDuration),
      ChargingDuration: parseFloat(chargingDuration),
      IdleTime: parseFloat(idleTime),
      IdleRatio: parseFloat(idleRatio)
    };

    try {
      let res;
      try {
        res = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (networkErr) {
        console.warn("FastAPI offline. Generating high-fidelity mock prediction result.", networkErr);
        setTimeout(() => {
          const avgSpeed = peakHour ? 22.0 : (nightCharging ? 7.2 : 15.0);
          const rawKwh = chargingDuration * avgSpeed * (isWeekend ? 1.1 : 0.95);
          const predictedKwh = Math.round(Math.max(3.0, Math.min(rawKwh, 88.0)) * 100) / 100;
          
          const congestionScore = (predictedKwh / 100.0) * 0.4 + (0.3 * peakHour) + (0.2 * isWeekend) + (0.1 * (1 - idleRatio));
          
          let congestion = "Medium";
          let tariff = 17.20;
          let strategy = "Normal";
          let score = 56.4;
          
          if (congestionScore >= 0.75) {
            congestion = "High";
            tariff = Math.round(15.0 * (1.3 + 0.3 * congestionScore) * 100) / 100;
            strategy = "Surge";
            score = Math.round((82 + Math.random() * 12) * 10) / 10;
          } else if (congestionScore < 0.4) {
            congestion = "Low";
            tariff = Math.round(15.0 * (0.8 + 0.15 * (congestionScore / 0.4)) * 100) / 100;
            strategy = "Discount";
            score = Math.round((12 + Math.random() * 25) * 10) / 10;
          } else {
            score = Math.round((45 + Math.random() * 32) * 10) / 10;
          }

          setResult({
            status: "success",
            predicted_kwh: predictedKwh,
            base_tariff: 15.0,
            dynamic_tariff: tariff,
            congestion_level: congestion,
            utilization_score: score,
            pricing_strategy: strategy,
            revenue_gain_percent: Math.round(((tariff - 15.0) / 15.0) * 10000) / 100,
            recommendation: congestion === 'High' ? "Peak demand active. Implement Surge Pricing to limit congestion." : "Stable operation. Normal optimized tariff applied."
          });
          addNotification("FastAPI server offline. Prediction computed using React fallback engine.", "warning");
          setLoading(false);
        }, 1000);
        return;
      }

      if (res.ok) {
        const json = await res.json();
        setResult(json);
        addNotification("Demand predicted and dynamic tariff calculated successfully!", "success");
      } else {
        let errDetail = "Inference failed";
        try {
          const jsonErr = await res.json();
          errDetail = jsonErr.detail || JSON.stringify(jsonErr);
        } catch (_) {
          try {
            errDetail = await res.text() || errDetail;
          } catch (__) {}
        }
        setError(errDetail);
        addNotification(`API Error: ${errDetail}`, "error");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      addNotification(`Error: ${err.message || "Inference failed"}`, "error");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Sparkles className="text-electric-400" size={32} />
          <span>Demand Prediction Engine</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Input session configurations and feed features directly to the LightGBM model to calculate exact charge capacities and tariffs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <form onSubmit={handlePredict} className="glass-panel p-6 space-y-6 lg:col-span-7">
          <h3 className="font-bold text-slate-200 text-base border-b border-slate-800 pb-3 uppercase tracking-wider">
            1. Session Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hour */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Hour of Day</span>
                <span className="text-electric-400 font-mono">{String(hour).padStart(2, '0')}:00</span>
              </label>
              <input 
                type="range" min="0" max="23" value={hour} 
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>

            {/* Month */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Month</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="glass-input w-full py-2"
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, idx) => (
                  <option key={m} value={idx + 1} className="bg-dark-900">{m}</option>
                ))}
              </select>
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Day of Week</label>
              <select 
                value={dayOfWeek} 
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                className="glass-input w-full py-2"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, idx) => (
                  <option key={d} value={idx} className="bg-dark-900">{d}</option>
                ))}
              </select>
            </div>

            {/* Session Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Session Duration</span>
                <span className="text-electric-400 font-mono">{sessionDuration.toFixed(1)} hrs</span>
              </label>
              <input 
                type="range" min="1.0" max="12.0" step="0.5" value={sessionDuration} 
                onChange={(e) => setSessionDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>

            {/* Charging Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Active Charging Duration</span>
                <span className="text-electric-400 font-mono">{chargingDuration.toFixed(1)} hrs</span>
              </label>
              <input 
                type="range" min="0.5" max="12.0" step="0.5" value={chargingDuration} 
                onChange={(e) => setChargingDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>
            
            {/* Auto calculations read-only */}
            <div className="glass-panel p-4 bg-dark-950/40 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Idle Time:</span>
                <p className="text-slate-200 font-bold font-mono text-sm mt-0.5">{idleTime} hrs</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Idle Ratio:</span>
                <p className="text-slate-200 font-bold font-mono text-sm mt-0.5">{(idleRatio * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-slate-200 text-xs border-t border-slate-800 pt-4 uppercase tracking-wider">
            2. Model Feature Flags (Computed)
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Peak Hour Flag */}
            <div className={`p-3 rounded-xl border ${peakHour ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-dark-950/20'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Peak Hour</span>
              <span className={`text-xs font-bold ${peakHour ? 'text-amber-400' : 'text-slate-500'} mt-1 block`}>
                {peakHour ? 'YES' : 'NO'}
              </span>
            </div>

            {/* Night Charging Flag */}
            <div className={`p-3 rounded-xl border ${nightCharging ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-dark-950/20'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Night Charge</span>
              <span className={`text-xs font-bold ${nightCharging ? 'text-indigo-400' : 'text-slate-500'} mt-1 block`}>
                {nightCharging ? 'YES' : 'NO'}
              </span>
            </div>

            {/* Weekend Flag */}
            <div className={`p-3 rounded-xl border ${isWeekend ? 'border-electric-500/30 bg-electric-500/5' : 'border-slate-800 bg-dark-950/20'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Weekend</span>
              <span className={`text-xs font-bold ${isWeekend ? 'text-electric-400' : 'text-slate-500'} mt-1 block`}>
                {isWeekend ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-base tracking-wide uppercase"
          >
            {loading ? (
              <>
                <Clock className="animate-spin" size={18} />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="text-amber-300" />
                <span>Predict Demand</span>
              </>
            )}
          </button>
        </form>

        {/* Prediction Results panel */}
        <div className="lg:col-span-5 h-full">
          <AnimatePresence mode="wait">
            {!loading && !result && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 text-center h-[520px] flex flex-col items-center justify-center space-y-4 border-dashed border-slate-800"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-300">Awaiting Simulation</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Adjust the sliders on the left and trigger the prediction engine to execute the dynamic optimization sequence.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 text-center h-[520px] flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-electric-500 animate-spin" />
                  <Zap size={32} className="text-electric-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Querying LightGBM Model</h3>
                  <p className="text-xs text-slate-500 mt-1">Estimating charging duration parameters and current line capacities...</p>
                </div>
                
                {/* Simulated progress bar */}
                <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="bg-electric-500 h-full"
                  />
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`glass-panel p-6 h-[520px] flex flex-col justify-between border-t-4 ${
                  result.pricing_strategy === 'Surge' ? 'border-t-red-500 glow-border-orange' : 
                  result.pricing_strategy === 'Discount' ? 'border-t-neon-500 glow-border-green' : 
                  'border-t-electric-500 glow-border-blue'
                }`}
              >
                {/* Result Top Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Operational Outcome</span>
                      <h3 className="text-2xl font-bold tracking-tight mt-0.5">Prediction Results</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 uppercase ${
                      result.pricing_strategy === 'Surge' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      result.pricing_strategy === 'Discount' ? 'bg-neon-500/10 text-neon-400 border border-neon-500/20' : 
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      <CheckCircle size={14} />
                      {result.pricing_strategy} Active
                    </span>
                  </div>

                  {/* Primary Metrics Group */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Predicted Demand</span>
                      <p className="text-3xl font-extrabold text-white mt-1 font-mono">{result.predicted_kwh} <span className="text-xs font-semibold text-slate-400">kWh</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dynamic Tariff</span>
                      <p className="text-3xl font-extrabold text-white mt-1 font-mono">₹{result.dynamic_tariff.toFixed(2)}<span className="text-xs font-semibold text-slate-400">/kWh</span></p>
                    </div>
                  </div>
                  
                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="bg-dark-950/40 p-2.5 rounded-xl text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Congestion</span>
                      <span className={`text-xs font-extrabold block mt-0.5 ${
                        result.congestion_level === 'High' ? 'text-red-400' : 
                        result.congestion_level === 'Medium' ? 'text-amber-400' : 'text-neon-400'
                      }`}>{result.congestion_level}</span>
                    </div>

                    <div className="bg-dark-950/40 p-2.5 rounded-xl text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Utilization</span>
                      <span className="text-xs font-extrabold text-slate-200 block mt-0.5">{result.utilization_score}%</span>
                    </div>

                    <div className="bg-dark-950/40 p-2.5 rounded-xl text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Revenue Shift</span>
                      <span className={`text-xs font-extrabold block mt-0.5 ${result.revenue_gain_percent >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                        {result.revenue_gain_percent >= 0 ? '+' : ''}{result.revenue_gain_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendation card bottom */}
                <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <ShieldCheck className="text-neon-400 animate-pulse" size={16} />
                    <span>Agent Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
