import React from 'react';
import { Cpu, ShieldCheck, HelpCircle, Layers, ArrowRight, Zap, Info } from 'lucide-react';

export default function AboutPage() {
  const featuresList = [
    { name: "Hour", type: "Integer (0-23)", description: "Time of session request. Captures commuting behavior." },
    { name: "Month", type: "Integer (1-12)", description: "Calendar month. Accounts for seasonal grid spikes and weather variables." },
    { name: "DayOfWeek", type: "Integer (0-6)", description: "0=Monday to 6=Sunday. Normalizes office vs holiday charging habits." },
    { name: "IsWeekend", type: "Binary (0/1)", description: "Flag for Saturday and Sunday sessions." },
    { name: "PeakHour", type: "Binary (0/1)", description: "Active commuting windows: 8:00-11:00 and 17:00-20:00." },
    { name: "NightCharging", type: "Binary (0/1)", description: "Off-peak hours from 22:00 to 05:00." },
    { name: "SessionDuration", type: "Float (hours)", description: "Total duration the vehicle remains plugged in at the charger port." },
    { name: "ChargingDuration", type: "Float (hours)", description: "Active hours spent drawing power from the grid." },
    { name: "IdleTime", type: "Float (hours)", description: "Duration plugged in but drawing zero power (Session - Charging duration)." },
    { name: "IdleRatio", type: "Float (0.0-1.0)", description: "Ratio of idle hours to overall session hours. High ratios flag charger hogging." }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Info className="text-electric-400" size={32} />
          <span>Technical Architecture & Details</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore the machine learning model specifications, feature definitions, and dynamic tariff calculation rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Solution Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Overview */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="text-electric-400" size={16} />
              <span>Project Overview</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              This application manages grid load volatility and maximizes charging infrastructure profitability. By predicting EV session energy delivery sizes (`kWhDelivered`) using a trained LightGBM machine learning model, the platform proactively gauges station occupancy, congestion levels, and grid strain.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              The pricing engine takes this predicted demand and applies real-time surge, discount, and idle fee rules to balance operations and boost turnover.
            </p>
          </div>

          {/* Section 2: Feature Matrix */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Cpu className="text-electric-400" size={16} />
              <span>Model Feature Matrix (Feature Dictionary)</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                    <th className="py-2 px-3">Feature Name</th>
                    <th className="py-2 px-3">Data Type</th>
                    <th className="py-2 px-3">Purpose & Description</th>
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map((f) => (
                    <tr key={f.name} className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">{f.name}</td>
                      <td className="py-3 px-3 text-electric-400 font-semibold">{f.type}</td>
                      <td className="py-3 px-3 text-slate-400">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Pricing Matrix & Architecture */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing Engine Details */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="text-neon-400" size={16} />
              <span>Pricing Strategy Matrix</span>
            </h3>

            <div className="space-y-4">
              {/* Surge */}
              <div className="border border-red-500/20 bg-red-500/5 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">1. Surge Pricing (High Congestion)</span>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Triggered during peak hours or heavy demand. Multiplies the base tariff of ₹15.00/kWh by 1.3x to 1.6x, reducing station crowding and balancing grid spikes.
                </p>
              </div>

              {/* Normal */}
              <div className="border border-blue-500/20 bg-blue-500/5 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">2. Optimized Normal (Medium Utilization)</span>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Active during midday hours or standard weekend charging. Multiplies the tariff by 1.05x to 1.25x based on real-time occupancies.
                </p>
              </div>

              {/* Discount */}
              <div className="border border-neon-500/20 bg-neon-500/5 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-neon-400 uppercase tracking-wider block">3. Green Discount (Low Demand)</span>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Applies a 5% to 20% discount on off-peak hours (e.g. night charging) to fill charging slots and attract fleet logistic operators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
