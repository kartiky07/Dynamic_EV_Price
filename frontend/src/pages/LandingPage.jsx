import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Cpu, Activity, AlertTriangle, ShieldCheck, ArrowRight, BatteryCharging, DollarSign } from 'lucide-react';

export default function LandingPage({ setPage }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-950 text-slate-100 scanline">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-electric-500 ambient-orb" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-500 ambient-orb" />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/30 px-4 py-1.5 rounded-full text-electric-400 text-sm font-semibold">
              <Zap size={16} className="animate-pulse" />
              <span>Next-Gen Smart Grid Integration</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none">
              AI-Powered Dynamic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-neon-400 to-electric-500">
                Tariff Optimization
              </span> <br />
              for EV Stations
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-slate-400 text-lg lg:text-xl max-w-xl font-normal leading-relaxed">
              AI-Driven Smart Pricing for EV Charging Infrastructure. Predict demand, balance grid congestion, reduce idle times, and maximize charging revenue in real-time.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <button 
                onClick={() => setPage('dashboard')} 
                className="btn-primary group"
              >
                <span>Launch Dashboard</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setPage('prediction')} 
                className="btn-secondary"
              >
                <span>Predict Demand</span>
              </button>
            </motion.div>

            {/* Metrics Snapshot */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div>
                <h3 className="text-3xl font-bold text-slate-100">2.16%</h3>
                <p className="text-sm text-slate-400 font-medium">Revenue Increase</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-100">-34%</h3>
                <p className="text-sm text-slate-400 font-medium">Peak Congestion</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-100">99.8%</h3>
                <p className="text-sm text-slate-400 font-medium">Grid Stability</p>
              </div>
            </motion.div>
          </div>
          
          {/* Hero Right: EV Graphic */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 flex justify-center relative"
          >
            <div className="w-[380px] h-[380px] rounded-full border border-electric-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-dashed border-neon-500/20 animate-[spin_60s_linear_infinite]" />
              <div className="w-[300px] h-[300px] rounded-full bg-dark-900/80 border border-slate-800 flex flex-col items-center justify-center relative shadow-2xl shadow-electric-500/10">
                <BatteryCharging size={80} className="text-neon-400 animate-bounce" />
                <span className="mt-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">Station Charging Status</span>
                <span className="text-2xl font-bold text-slate-100 mt-2">Active Optimizing</span>
                <div className="absolute bottom-6 flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neon-500 animate-ping" />
                  <span className="text-xs text-neon-400 font-semibold">Surge Pricing Engine ON</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold">The Core Smart Optimization Solution</h2>
          <p className="text-slate-400">
            A dynamic infrastructure optimization suite designed to bridge the gap between volatile electrical grid loads and consumer EV charging requirements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="glass-panel p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center text-electric-400">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold">AI Demand Forecasting</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uses a LightGBM Machine Learning model trained on hourly session logs to predict exact energy delivery constraints (kWh) per session based on time, calendar context, and duration.
              </p>
            </div>
            <span className="text-xs font-bold text-electric-400 uppercase tracking-wider flex items-center gap-1">
              Learn More <ArrowRight size={12} />
            </span>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="glass-panel p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neon-500/10 border border-neon-500/20 flex items-center justify-center text-neon-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold">Revenue Optimization</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Switches stations from static flat tariffs to surge and discount pricing models. Increases station profits during peak hour congestion while capturing price-sensitive night users.
              </p>
            </div>
            <span className="text-xs font-bold text-neon-400 uppercase tracking-wider flex items-center gap-1">
              Learn More <ArrowRight size={12} />
            </span>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="glass-panel p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold">Grid Congestion Reduction</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Identifies heavy charging congestion risks instantly. Uses automatic surge multipliers to throttle excessive grid requests, promoting balanced load distributions.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              Learn More <ArrowRight size={12} />
            </span>
          </motion.div>
        </div>
      </div>

      {/* Problem & Solution Deep Dive */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem Statement */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>The Infrastructure Challenge</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">Static Pricing Creates Station Congestion & Lost Revenue</h2>
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>
                As EV ownership grows, charging stations experience massive usage spikes during peak commuting hours (8-11 AM and 5-9 PM). Static flat-rate tariffs fail to encourage off-peak charging, resulting in long queues, grid overload, and lost potential revenue.
              </p>
              <p>
                Furthermore, station operators lose space and charging bandwidth to "idle cars" — vehicles that remain connected to the charger long after the battery is full. Traditional charging software does not optimize rates dynamically to combat this behavioral issue.
              </p>
            </div>
          </div>
          
          {/* Solution Architecture */}
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-neon-400" size={24} />
              <span>AI-Driven Optimization Engine</span>
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-electric-400 font-bold text-lg pt-1">01</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">LightGBM Demand Estimator</h4>
                  <p className="text-xs text-slate-400 mt-1">Predicts kWh requirements before the session starts, analyzing month, hour, day, and session attributes.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-electric-400 font-bold text-lg pt-1">02</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">Real-time Congestion Analytics</h4>
                  <p className="text-xs text-slate-400 mt-1">Determines charger congestion risk based on current session queues, idle ratios, and time profiles.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-electric-400 font-bold text-lg pt-1">03</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-base">Dynamic Surge & Discount Rules</h4>
                  <p className="text-xs text-slate-400 mt-1">Applies instant surge pricing to limit station clogging, and discount incentives to capture night fleets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-7xl mx-auto px-6 py-12 mb-20 relative z-10">
        <div className="glass-panel p-12 bg-gradient-to-r from-electric-650/40 via-dark-900 to-neon-650/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-grid-pattern bg-[size:20px_20px] opacity-10" />
          <h2 className="text-4xl font-extrabold mb-4 relative z-10">Ready to Optimize Station Operations?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 relative z-10">
            Explore the dashboard, run demand predictions, or try out the pricing simulator to see the AI agent in action.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <button onClick={() => setPage('dashboard')} className="btn-primary">
              <span>Access Control Panel</span>
            </button>
            <button onClick={() => setPage('about')} className="btn-secondary">
              <span>View Technical Architecture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
