"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, TerminalSquare, RefreshCw, Layers, CheckCircle } from "lucide-react";

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

  const TopNav = () => (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
          CostIntel
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Overview</Link>
          <Link href="/actions" className="text-muted-foreground hover:text-primary transition-colors">AI Actions</Link>
          <Link href="/anomalies" className="text-muted-foreground hover:text-primary transition-colors">Risks & Anomalies</Link>
          <Link href="/sla" className="text-muted-foreground hover:text-primary transition-colors">Impact</Link>
          <Link href="/audit" className="text-primary transition-colors border-b-2 border-primary py-5">Audit Trail</Link>
        </nav>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <TerminalSquare className="h-8 w-8 text-slate-400" />
            Technical Audit Trail
          </h1>
          <p className="text-slate-400 max-w-3xl">
            A transparent, chronological log of exactly what the multi-agent AI system executed behind the scenes.
            Optional view for system administrators and compliance teams.
          </p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-300">
              <Layers className="h-5 w-5 text-indigo-400" /> 
              Multi-Agent Traces
            </h2>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
              Read-only system log
            </div>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                Loading execution traces...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No technical logs found. Run a simulation first.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {logs.map((log, i) => (
                  <div key={i} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Agent: {log.agent}
                      </div>
                      <span className="text-sm font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {i === logs.length - 1 && <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] ml-auto animate-pulse"></span>}
                    </div>
                    
                    <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto border border-slate-800">
                      <div className="text-indigo-300 mb-2 font-bold flex items-center gap-2">
                        <TerminalSquare className="h-4 w-4" /> {log.event.toUpperCase()}
                      </div>
                      <pre className="text-xs text-slate-400">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                
                {logs.length > 0 && (
                  <div className="p-6 bg-green-500/5 text-center flex items-center justify-center gap-2 border-t border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-400 font-medium">Pipeline execution successfully terminated.</span>
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
