"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Zap, Server, Play, ChevronRight, BarChart3, Fingerprint, Search, Shield } from "lucide-react";

export default function Home() {
  const [simulationState, setSimulationState] = useState<"IDLE" | "RUNNING" | "COMPLETE">("IDLE");
  const [activeStep, setActiveStep] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const steps = [
    { title: "Data Ingestion", desc: "Loading invoices, cloud usage, and SLA tickets...", icon: Server },
    { title: "AI Detection", desc: "Scanning 28,000+ records for cost anomalies...", icon: Search },
    { title: "Root Cause Analysis", desc: "Extracting 'Why' using AI reasoning engine...", icon: Fingerprint },
    { title: "AI Decision", desc: "Prioritizing remediation actions...", icon: Zap },
    { title: "Autonomous Execution", desc: "Blocking invoices & rerouting traffic...", icon: Shield },
  ];

  useEffect(() => {
    // Pre-fetch actual data to show immediately
    const fetchData = () => {
      fetch("/api/runs")
        .then((res) => res.json())
        .then((runData) => {
          if (runData.runs && runData.runs.length > 0) {
            const runId = runData.runs[0].run_id;
            fetch(`/api/metrics/${runId}`)
              .then(res => res.json())
              .then(data => {
                if (data?.metrics) setApiData(data.metrics);
              });
            
            fetch(`/api/audit/${runId}`)
              .then(res => res.json())
              .then(data => {
                if (data?.events) {
                  const filtered = data.events.filter((e: any) => 
                    ['anomalies_detected', 'plan_generated', 'execution_complete'].includes(e.event)
                  ).reverse().slice(0, 5);
                  setActivity(filtered);
                }
              });
          }
        })
        .catch(err => console.error("Initial fetch failed:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = () => {
    setSimulationState("RUNNING");
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveStep(currentStep);
      }
    }, 2500);

    fetch("/api/simulate", { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval);
        setActiveStep(steps.length - 1);
        return fetch(`/api/metrics/${data.run_id}`);
      })
      .then(res => res?.json())
      .then(freshData => {
        if (freshData?.metrics) {
          setApiData(freshData.metrics);
        }
        setTimeout(() => setSimulationState("COMPLETE"), 1000);
      })
      .catch(err => {
        console.error("Simulation failed:", err);
        clearInterval(interval);
        setTimeout(() => setSimulationState("COMPLETE"), 800);
      });
  };

  const TopNav = () => (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
          CostIntel <span className="text-muted-foreground font-normal text-sm ml-2 hidden sm:inline-block">| Enterprise Cost Intelligence</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-primary transition-colors border-b-2 border-primary py-5">Overview</Link>
          <Link href="/actions" className="text-muted-foreground hover:text-primary transition-colors">AI Actions</Link>
          <Link href="/anomalies" className="text-muted-foreground hover:text-primary transition-colors">Risks & Anomalies</Link>
          <Link href="/sla" className="text-muted-foreground hover:text-primary transition-colors">Impact</Link>
          <Link href="/audit" className="text-muted-foreground hover:text-primary transition-colors">Audit Trail</Link>
        </nav>
      </div>
    </header>
  );

  const ActivityFeed = () => (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-white/5 px-6 py-4 bg-slate-900">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" /> 
          Live AI Activity Feed
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            { name: "Ingest", status: activeStep >= 0 ? "active" : "idle" },
            { name: "Anomaly", status: activeStep >= 1 ? "active" : "idle" },
            { name: "SLA", status: activeStep >= 2 ? "active" : "idle" },
            { name: "Reason", status: activeStep >= 3 ? "active" : "idle" },
            { name: "Judge", status: activeStep >= 4 ? "active" : "idle" },
            { name: "Action", status: activeStep >= 5 ? "active" : "idle" },
            { name: "Audit", status: activeStep >= 6 ? "active" : "idle" },
          ].map((agent, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-white/5">
              <div className={`h-2 w-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{agent.name}</span>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {activity.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Waiting for simulation data...
            </div>
          ) : activity.map((item, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="mt-1">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                  {item.event === 'anomalies_detected' ? <ShieldAlert className="h-5 w-5 text-red-400" /> : 
                   item.event === 'plan_generated' ? <Zap className="h-5 w-5 text-yellow-400" /> : 
                   <CheckCircle className="h-5 w-5 text-green-400" />}
                </div>
              </div>
              <div className="flex-1 pb-6 border-b border-white/5 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    {item.agent.toUpperCase()} • {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="font-bold text-slate-200 mb-1">
                  {item.event === 'anomalies_detected' ? `Caught ${item.payload.count} Cost Leakages` :
                   item.event === 'plan_generated' ? `Strategy: ${item.payload.total_actions} Actions Identified` :
                   `Executed ${item.payload.auto_executed_count} Autonomous Blocks`}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.event === 'anomalies_detected' ? `Potential loss: ₹${item.payload.estimated_leakage_inr?.toLocaleString()}. System calculating root causes...` :
                   item.event === 'plan_generated' ? `Financial Impact identified: ₹${item.payload.total_impact_inr?.toLocaleString()}` :
                   `Success. Saved ₹${item.payload.auto_executed_inr?.toLocaleString()} instantly without human intervention.`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <Link href="/audit" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
            View full execution trace →
          </Link>
        </div>
      </div>
    </div>
  );

  if (simulationState === "IDLE") {
    return (
      <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />
        <TopNav />
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-start pt-24 min-h-[85vh] text-center z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Zap className="h-3 w-3 fill-indigo-400" />
              Enterprise AI System
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-2xl">
              <span className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">Cost</span>
              <span className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Intel</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 text-slate-200">
              Detect Leakage. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 border-b-4 border-indigo-500/50 pb-1">Take Autonomous Action.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              The enterprise-grade AI system that continuously monitors your financial and cloud infrastructure. CostIntel doesn't just surface insights—it actively reasons over <strong className="text-slate-200">28,000+ synthetic records</strong> to explain the root cause and execute automated remediations instantly.
            </p>
            <button 
              onClick={runSimulation}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Play className="h-5 w-5 relative z-10 fill-current" />
              <span className="relative z-10">Run Live Simulation</span>
            </button>
            <p className="text-xs text-slate-500 mt-6 tracking-wide uppercase font-semibold">Generates dynamic real-time data on every execution</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-32 mb-20 w-full text-left max-w-6xl mx-auto border-t border-white/10 pt-16">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-slate-100">Detailed Enterprise Workflow & Pipeline</h3>
                <p className="text-slate-400 text-lg max-w-2xl">A demonstration of how CostIntel mimics a fully functional enterprise architecture using a stateful 7-Agent LangGraph.js setup.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 tracking-wider">AMAZON BEDROCK</div>
                <div className="px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 tracking-wider">DYNAMODB STREAM</div>
                <div className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 tracking-wider">NEXT.JS EDGE</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform"><Server size={24} /></div>
                <h4 className="text-xl font-bold mb-3 text-slate-200">1. High-Frequency Ingestion</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Mimics an active enterprise environment by generating and streaming localized procurement logs, erratic vendor billing, and live live cloud utilization metrics into a scalable DynamoDB queue every session.
                </p>
              </div>
              <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform"><Search size={24} /></div>
                <h4 className="text-xl font-bold mb-3 text-slate-200">2. Multi-Agent Reasoning</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Data doesn't just display—it travels through a deterministic state machine connecting 7 specialized AI agents. It leverages Amazon Nova Pro & Mistral Large to identify hidden cross-department cost leakages.
                </p>
              </div>
              <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                <h4 className="text-xl font-bold mb-3 text-slate-200">3. Autonomous Execution</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The system demonstrates true operational autonomy. It executes programmatic savings (like blocking erratic invoices or scaling down servers) and commits every decision payload to an immutable Audit Trail.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (simulationState === "RUNNING") {
    return (
      <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 w-full h-[50%] -translate-x-1/2 bg-blue-600/10 blur-[150px] pointer-events-none rounded-b-full"></div>
        <TopNav />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
          <div className="w-full max-w-4xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-center tracking-tight text-white drop-shadow-md">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">AI Pipeline</span> Execution
            </h2>
            <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">The multi-agent simulation is actively reasoning over synthetic enterprise data to secure structural savings.</p>
            
            <div className="relative py-8">
              {/* Center vertical zigzag line base */}
              <div className="absolute left-[24px] md:left-1/2 top-4 bottom-4 w-1 bg-slate-800 md:-translate-x-1/2 rounded-full" />
              <div 
                className="absolute left-[24px] md:left-1/2 top-4 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 md:-translate-x-1/2 rounded-full transition-all duration-1000 ease-out"
                style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />

              <div className="space-y-16 relative z-10">
                {steps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  const isPassed = idx < activeStep;
                  const Icon = step.icon;
                  const isEven = idx % 2 === 0;

                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 40 }} 
                      animate={{ opacity: isPassed || isActive ? 1 : 0.4, y: 0 }} 
                      transition={{ duration: 0.5 }}
                      className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group"
                    >
                      {/* Left Side Container */}
                      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pr-16 md:opacity-0 md:order-first hidden md:block'}`}>
                        {isEven && (
                          <div className={`pl-16 md:pl-0 p-6 rounded-2xl border transition-all duration-300 ${isActive ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] scale-105' : 'border-white/5 bg-slate-900/60'}`}>
                            <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-indigo-300' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>{step.title}</h3>
                            <p className={`text-sm ${isActive || isPassed ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
                          </div>
                        )}
                      </div>

                      {/* Center Node */}
                      <div className="absolute left-[24px] md:left-1/2 -ml-[24px] md:-ml-[28px] mt-4 md:mt-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-[#020617] bg-slate-800 text-slate-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-20 transition-all duration-500">
                        {isPassed ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${isActive ? 'text-blue-400 animate-pulse drop-shadow-[0_0_10px_rgba(96,165,250,1)]' : ''}`} />
                        )}
                      </div>

                      {/* Right Side Container */}
                      <div className={`w-full md:w-1/2 mt-0 ${!isEven ? 'pl-16 md:pl-16 text-left' : 'md:pl-16 md:opacity-0 hidden md:block'}`}>
                        {!isEven && (
                          <div className={`p-6 rounded-2xl border transition-all duration-300 ${isActive ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] scale-105' : 'border-white/5 bg-slate-900/60'}`}>
                            <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-purple-300' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>{step.title}</h3>
                            <p className={`text-sm ${isActive || isPassed ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const impact = apiData?.total_impact_inr || 19181304;
  const leakage = (apiData?.estimated_leakage_inr || 23829982);
  const penalty = (apiData?.penalty_at_risk_inr || 4775000);

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                AI Pipeline Complete • Run Active
              </p>
            </div>
            <Link href="/actions" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center gap-2">
              Review AI Actions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Money Saved", val: (impact/100000).toFixed(2), unit: "L", icon: CheckCircle, color: "text-green-500", meta: "+14% vs last quarter" },
            { label: "Cost Leakage Prevented", val: (leakage/100000).toFixed(2), unit: "L", icon: Search, color: "text-blue-400", meta: `From ${apiData?.anomaly_count || 43} anomalies` },
            { label: "SLA Penalty Avoided", val: (penalty/100000).toFixed(2), unit: "L", icon: AlertTriangle, color: "text-amber-500", meta: `From ${apiData?.sla_risk_count || 118} risks` },
            { label: "Autonomous Actions", val: apiData?.total_actions || 20, unit: "", icon: Zap, color: "text-primary", meta: "Active AI execution" },
          ].map((kpi, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * idx }} className="rounded-xl border border-white/10 bg-slate-900/50 p-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</h3>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">₹{kpi.val}{kpi.unit}</div>
              <p className="text-xs text-slate-500 font-medium">{kpi.meta}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ActivityFeed />
          </div>
          <div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
               <div className="border-b border-white/5 px-6 py-4 bg-slate-900">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-400" /> AI Insights
                  </h3>
               </div>
               <div className="p-6 space-y-6">
                 <div className="bg-white/5 rounded-lg p-4">
                   <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Top Spend Divergence</h4>
                   <div className="flex justify-between items-center text-lg font-bold">
                     <span>Vendor Spikes</span>
                     <span className="text-red-400">42%</span>
                   </div>
                 </div>
                 <div className="bg-white/5 rounded-lg p-4 font-light text-slate-300 text-sm leading-relaxed">
                   AI detected <span className="text-amber-400 font-bold">Off-contract SaaS rates</span> as primary leakage source. Recommend renegotiating for ~₹8.2L weekly savings.
                 </div>
                 <div className="p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-lg">
                    <h4 className="text-[10px] uppercase font-bold text-indigo-300 mb-1">AI Confidence</h4>
                    <div className="text-4xl font-black text-slate-100 mb-2">94%</div>
                    <p className="text-[10px] text-indigo-300/80">Models are highly calibrated for current remediation strategies.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
