"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TerminalSquare, RefreshCw, Layers, CheckCircle, Activity } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs")
      .then(res => res.json())
      .then(runData => {
        if (runData.runs && runData.runs.length > 0) {
          fetch(`/api/audit/${runData.runs[0].run_id}`)
            .then(res => res.json())
            .then(data => {
              if (data?.events) {
                setLogs(data.events);
              }
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-8 selection:bg-blue-500/30">
      <main className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-white/40 mb-4">
               <TerminalSquare className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Technical Multi-Agent Tracing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
              Audit <span className="text-white/40">Trail.</span>
            </h1>
            <p className="text-white/40 text-xl font-medium tracking-tight leading-relaxed">
              A transparent, chronological log of exactly what the multi-agent AI system executed 
              behind the scenes. Full observability for compliance and system auditing.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-3xl transition-all hover:bg-white/10">
             <RefreshCw className={`h-3 w-3 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Observability Active</span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <Layers className="h-5 w-5 text-blue-500" /> 
              Multi-Agent Execution Log
            </h2>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Read-Only System Trace
            </div>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="p-24 text-center">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-6 text-white/30" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Decrypting Traces...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-24 text-center">
                <p className="text-lg font-bold text-white/30 uppercase tracking-widest italic">No technical logs found in current state.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {logs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-8 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        AGENT: {log.agent}
                      </div>
                      <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {i === 0 && (
                        <span className="ml-auto inline-flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Latest Transition</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="text-blue-400 mb-4 font-black flex items-center gap-2 text-sm uppercase tracking-tighter">
                        <Activity className="h-4 w-4" /> {log.event.replace(/_/g, " ")}
                      </div>
                      <pre className="text-xs text-white/40 font-mono leading-relaxed overflow-x-auto selection:bg-blue-500/40 selection:text-white">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                ))}
                
                {logs.length > 0 && (
                  <div className="p-10 bg-green-500/5 text-center flex items-center justify-center gap-3 border-t border-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-500/40" />
                    <span className="text-[10px] font-black text-green-500/40 uppercase tracking-[0.5em]">Pipeline Sequence Terminated Correctfully</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
