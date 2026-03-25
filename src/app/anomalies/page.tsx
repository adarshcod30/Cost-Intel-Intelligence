"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Info, AlertCircle, RefreshCw, BarChart, Search, Activity, Cpu } from "lucide-react";
import { formatINR } from "@/lib/formatINR";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs")
      .then((res) => res.json())
      .then((runData) => {
        if (runData.runs && runData.runs.length > 0) {
          const runId = runData.runs[0].run_id;
          return fetch(`/api/audit/${runId}`);
        }
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.events) {
          const detEvent = data.events.find((log: any) => log.event === "anomalies_detected");
          if (detEvent?.payload?.anomalies) {
            setAnomalies(detEvent.payload.anomalies.map((a: any) => ({
              ...a,
              invoice_id: a.invoice_id || a.entity_id || 'N/A',
              anomaly_type: a.anomaly_type || 'cost_spike',
              category: a.category || 'Infrastructure',
              cost: a.cost || a.impact || 0,
              vendor_name: a.vendor_name || 'Generic Vendor',
              service_type: a.service_type || 'Cloud Services'
            })));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-8 selection:bg-blue-500/30">
      <main className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
               <AlertTriangle className="h-5 w-5 fill-current" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Real-Time Risk Detection</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
              Risks & <span className="text-white/60">Anomalies.</span>
            </h1>
            <p className="text-white/60 text-xl font-medium tracking-tight leading-relaxed">
              CostIntel's unsupervised algorithms scan 100% of incoming telemetry.
              Every cost spike, duplicate charge, and idle resource is flagged for autonomous remediation.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-3xl transition-all hover:bg-white/10">
             <RefreshCw className={`h-3 w-3 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Feed Active</span>
          </div>
        </div>

        {/* Intelligence Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 backdrop-blur-3xl hover:border-blue-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
               <Info className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Model Logic</h3>
            <p className="text-white/60 font-medium leading-relaxed italic">
              "System leverages isolation forest algorithms on 28k+ record clusters to identify outliers 
              deviating from 7-day rolling baselines."
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 backdrop-blur-3xl hover:border-red-500/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
               <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Impact Thresholds</h3>
            <p className="text-white/60 font-medium leading-relaxed italic">
              "Any anomaly exceeding ₹50,000 or 15% of vendor average is automatically escalated 
              to the Action Executor for immediate blocking."
            </p>
          </motion.div>
        </div>

        {/* Table Section */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <Activity className="h-5 w-5 text-red-500" /> 
              Active Detection Stream
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-white/60 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Risk Type</th>
                  <th className="px-10 py-6">AI Context</th>
                  <th className="px-10 py-6 text-right">Leakage Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-24 text-center">
                      <Loader h="h-12 w-12" />
                    </td>
                  </tr>
                ) : anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-24 text-center font-bold text-white/60 uppercase tracking-widest italic">
                      No active anomalies detected in current stream.
                    </td>
                  </tr>
                ) : anomalies.map((a, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                       <div className="font-mono text-[10px] text-white/50 uppercase tracking-widest mb-1">{a.invoice_id}</div>
                       <div className="font-black text-white group-hover:text-blue-400 transition-colors uppercase text-sm">{a.category}</div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${
                        a.anomaly_type === 'duplicate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        a.anomaly_type === 'cost_spike' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        a.anomaly_type === 'idle_resource' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {a.anomaly_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="text-sm font-black text-white/80">{a.vendor_name} | {a.service_type}</span>
                        <span className="text-xs text-white/50 italic font-medium">
                          {a.anomaly_type === 'duplicate' ? 'Exact statistical match found within window.' :
                           a.anomaly_type === 'cost_spike' ? `Massive deviation from cluster centroid.` :
                           'Pattern detected below utilization guardrails.'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="text-2xl font-black text-red-400 leading-none mb-1">
                         ₹{formatINR(a.cost)}
                       </div>
                       <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Calculated Risk</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Loader({h}: {h: string}) {
  return (
    <div className={`flex flex-col items-center gap-4 ${h} mx-auto opacity-20`}>
       <RefreshCw className="h-full w-full animate-spin" />
       <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scanning...</span>
    </div>
  )
}
