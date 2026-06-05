import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, BarChart2, CheckCircle, RefreshCw, HelpCircle, ShieldAlert, ArrowRight, DollarSign } from 'lucide-react';

export default function PricingSimulator({ addNotification }) {
  const [baseTariff, setBaseTariff] = useState(15.0);
  const [congestionFactor, setCongestionFactor] = useState(0.60);
  const [stationUtilization, setStationUtilization] = useState(65.0);
  const [predictedDemand, setPredictedDemand] = useState(30.0);
  
  const [simResults, setSimResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    const payload = {
      base_tariff: parseFloat(baseTariff),
      congestion_factor: parseFloat(congestionFactor),
      station_utilization: parseFloat(stationUtilization),
      predicted_demand: parseFloat(predictedDemand)
    };

    try {
      const res = await fetch('http://localhost:8000/dynamic-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const json = await res.json();
        setSimResults(json);
        setIsLive(true);
      } else {
        throw new Error("Sim endpoint failed");
      }
    } catch (err) {
      console.warn("FastAPI offline. Running React client simulator engine.", err);
      // Simulate locally
      setIsLive(false);
      setTimeout(() => {
        const base = parseFloat(baseTariff);
        const factor = parseFloat(congestionFactor);
        const util = parseFloat(stationUtilization);
        const demand = parseFloat(predictedDemand);
        
        const score = factor * 0.5 + (util / 100.0) * 0.5;
        let pricingStrategy = "Normal";
        let congestionLevel = "Medium";
        let tariff = base;
        
        if (score >= 0.75) {
          congestionLevel = "High";
          tariff = base * (1.3 + 0.35 * score);
          pricingStrategy = "Surge";
        } else if (score < 0.40) {
          congestionLevel = "Low";
          tariff = base * (0.8 + 0.15 * (score / 0.40));
          pricingStrategy = "Discount";
        } else {
          tariff = base * (1.05 + 0.20 * (score - 0.40) / 0.35);
        }
        
        tariff = Math.round(tariff * 100) / 100;
        const fixedRevenue = demand * base;
        const dynamicRevenue = demand * tariff;
        const gain = ((dynamicRevenue - fixedRevenue) / maxVal(1.0, fixedRevenue)) * 100.0;
        
        const surgeSurcharge = pricingStrategy === "Surge" ? Math.round((tariff - base) * 100) / 100 : 0.0;
        const discountAmount = pricingStrategy === "Discount" ? Math.round((base - tariff) * 100) / 100 : 0.0;
        const congestionCharge = Math.round(base * 0.15 * factor * 100) / 100;
        const utilizationCharge = Math.round(base * 0.10 * (util / 100.0) * 100) / 100;
        
        setSimResults({
          pricing_strategy: pricingStrategy,
          congestion_level: congestionLevel,
          base_tariff: base,
          dynamic_tariff: tariff,
          revenue_gain_percent: Math.round(gain * 100) / 100,
          fixed_revenue: Math.round(fixedRevenue * 100) / 100,
          dynamic_revenue: Math.round(dynamicRevenue * 100) / 100,
          breakdown: {
            base_rate: base,
            congestion_charge: congestionCharge,
            utilization_charge: utilizationCharge,
            surge_surcharge: surgeSurcharge,
            discount_amount: discountAmount
          }
        });
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const maxVal = (a, b) => (a > b ? a : b);

  // Trigger simulation runs when inputs change
  useEffect(() => {
    const handler = setTimeout(() => {
      runSimulation();
    }, 150); // Small debounce to prevent overloading backend
    
    return () => clearTimeout(handler);
  }, [baseTariff, congestionFactor, stationUtilization, predictedDemand]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sliders className="text-electric-400" size={32} />
            <span>Dynamic Pricing Sandbox</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate custom charging station environments, tweak congestion parameters, and study the dynamic tariff adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold">
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-neon-500 animate-ping' : 'bg-orange-500'}`} />
          <span className="text-slate-300">{isLive ? 'Live Engine Connected' : 'Local Client Engine'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Panel */}
        <div className="glass-panel p-6 space-y-6 lg:col-span-6">
          <h3 className="font-bold text-slate-200 text-base border-b border-slate-800 pb-3 uppercase tracking-wider">
            1. Simulator Controls
          </h3>

          <div className="space-y-6">
            {/* Base Tariff */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Base Charging Tariff</span>
                <span className="text-electric-400 font-mono">₹{baseTariff.toFixed(1)}/kWh</span>
              </label>
              <input 
                type="range" min="10.0" max="25.0" step="0.5" value={baseTariff}
                onChange={(e) => setBaseTariff(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>

            {/* Congestion Factor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Congestion Level Factor</span>
                <span className="text-electric-400 font-mono">{(congestionFactor * 100).toFixed(0)}%</span>
              </label>
              <input 
                type="range" min="0.0" max="1.0" step="0.05" value={congestionFactor}
                onChange={(e) => setCongestionFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>

            {/* Station Utilization */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Station Port Utilization</span>
                <span className="text-electric-400 font-mono">{stationUtilization.toFixed(0)}%</span>
              </label>
              <input 
                type="range" min="0.0" max="100.0" step="5" value={stationUtilization}
                onChange={(e) => setStationUtilization(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>

            {/* Predicted Demand */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Estimated Energy demand</span>
                <span className="text-electric-400 font-mono">{predictedDemand.toFixed(1)} kWh</span>
              </label>
              <input 
                type="range" min="5.0" max="80.0" step="1.0" value={predictedDemand}
                onChange={(e) => setPredictedDemand(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-500"
              />
            </div>
          </div>
          
          <div className="bg-dark-950/40 p-4 rounded-xl flex items-start gap-3 border border-slate-800 text-xs leading-relaxed text-slate-400">
            <HelpCircle size={18} className="text-electric-400 shrink-0 mt-0.5" />
            <p>
              Tweak the sliders to represent grid demand spikes. When congestion exceeds 75% or utilization hits heavy limits, the system triggers the <strong>Surge pricing multiplier</strong>. Conversely, low loads trigger <strong>Discount modes</strong>.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-6 space-y-6">
          {simResults && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 text-base uppercase tracking-wider">
                  2. Pricing Analysis Yields
                </h3>
                
                {/* Colored status badge */}
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 uppercase ${
                  simResults.pricing_strategy === 'Surge' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  simResults.pricing_strategy === 'Discount' ? 'bg-neon-500/10 text-neon-400 border border-neon-500/20' : 
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {simResults.pricing_strategy} Mode
                </span>
              </div>

              {/* Side-by-side Tariff comparison */}
              <div className="grid grid-cols-2 gap-6 bg-dark-950/50 p-4 rounded-xl border border-slate-800">
                <div className="text-center border-r border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fixed Base Tariff</span>
                  <p className="text-3xl font-extrabold text-slate-400 mt-1 font-mono">₹{simResults.base_tariff.toFixed(2)}</p>
                  <span className="text-[10px] text-slate-500 block">per kWh flat rate</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dynamic Tariff</span>
                  <p className={`text-3xl font-extrabold mt-1 font-mono ${
                    simResults.pricing_strategy === 'Surge' ? 'text-red-400' :
                    simResults.pricing_strategy === 'Discount' ? 'text-neon-400' : 'text-blue-400'
                  }`}>₹{simResults.dynamic_tariff.toFixed(2)}</p>
                  <span className="text-[10px] text-slate-500 block">optimized rate</span>
                </div>
              </div>

              {/* Side-by-side Revenue Comparison */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Session Revenue Yield</span>
                
                <div className="space-y-4">
                  {/* Fixed Pricing bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Fixed Tariff Yield</span>
                      <span className="font-mono text-slate-300">₹{simResults.fixed_revenue.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>

                  {/* Dynamic Pricing bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Dynamic Tariff Yield</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white">₹{simResults.dynamic_revenue.toFixed(2)}</span>
                        <span className={`text-[10px] font-bold ${simResults.revenue_gain_percent >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                          ({simResults.revenue_gain_percent >= 0 ? '+' : ''}{simResults.revenue_gain_percent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        simResults.revenue_gain_percent >= 0 ? 'bg-neon-500' : 'bg-red-500'
                      }`} style={{ width: `${60 * (1 + simResults.revenue_gain_percent / 100.0)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown meters */}
              <div className="space-y-3 pt-4 border-t border-slate-850">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rate Composition Breakdown</span>
                
                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                  {/* Base */}
                  <div className="bg-dark-950/40 p-2 rounded-lg">
                    <span className="text-slate-500 block">Base Rate</span>
                    <span className="font-bold font-mono text-slate-200 mt-1 block">₹{simResults.breakdown.base_rate}</span>
                  </div>
                  
                  {/* Congestion */}
                  <div className="bg-dark-950/40 p-2 rounded-lg">
                    <span className="text-slate-500 block">Congestion</span>
                    <span className="font-bold font-mono text-amber-400 mt-1 block">+₹{simResults.breakdown.congestion_charge}</span>
                  </div>

                  {/* Utilization */}
                  <div className="bg-dark-950/40 p-2 rounded-lg">
                    <span className="text-slate-500 block">Util Fee</span>
                    <span className="font-bold font-mono text-electric-400 mt-1 block">+₹{simResults.breakdown.utilization_charge}</span>
                  </div>

                  {/* Surge */}
                  <div className="bg-dark-950/40 p-2 rounded-lg">
                    <span className="text-slate-500 block">Surge premium</span>
                    <span className="font-bold font-mono text-red-400 mt-1 block">+₹{simResults.breakdown.surge_surcharge}</span>
                  </div>

                  {/* Discount */}
                  <div className="bg-dark-950/40 p-2 rounded-lg">
                    <span className="text-slate-500 block">Discount</span>
                    <span className="font-bold font-mono text-neon-400 mt-1 block">-₹{simResults.breakdown.discount_amount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
