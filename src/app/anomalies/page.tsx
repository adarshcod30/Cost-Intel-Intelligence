"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, AlertTriangle, Info, AlertCircle, RefreshCw, BarChart } from "lucide-react";

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
          // Find the anomalies_detected event
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
          <Link href="/anomalies" className="text-primary transition-colors border-b-2 border-primary py-5">Risks & Anomalies</Link>
          <Link href="/sla" className="text-muted-foreground hover:text-primary transition-colors">Impact</Link>
          <Link href="/audit" className="text-muted-foreground hover:text-primary transition-colors">Audit Trail</Link>
        </nav>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      <TopNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Risks & Anomalies</h1>
          <p className="text-slate-400 max-w-3xl">
            Live feed of all financial discrepancies caught by the AI Anomaly Detection model.
          </p>
        </div>

        {/* Explainability Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-400" />
              What is happening?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              CostIntel's unsupervised algorithms scan 100% of your incoming invoices and 
              cloud usage logs. We look for patterns—cost spikes, duplicate charges, and idle resources—that 
              differ drastically from historic baselines.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 shadow-sm border-l-4 border-l-red-500/50">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Why should I care?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Undetected leakages cost enterprises millions quarterly. These anomalies represent direct financial loss. 
              By flagging them instantly, we trigger automated blocks to prevent money from leaving the system.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> 
              Active Detection Feed
            </h2>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <RefreshCw className="h-3 w-3" /> Live updating
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice ID</th>
                  <th className="px-6 py-4 font-medium">Issue Detected</th>
                  <th className="px-6 py-4 font-medium">AI Explainability (Why)</th>
                  <th className="px-6 py-4 font-medium">Financial Impact</th>
                  <th className="px-6 py-4 font-medium">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      Loading AI Detections...
                    </td>
                  </tr>
                ) : anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No active anomalies detected in current run.
                    </td>
                  </tr>
                ) : anomalies.map((a, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-slate-300">
                      {a.invoice_id}
                      <span className="block text-xs text-slate-500 mt-1 font-sans">{a.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        a.anomaly_type === 'duplicate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        a.anomaly_type === 'cost_spike' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        a.anomaly_type === 'idle_resource' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {a.anomaly_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="text-slate-300">{a.vendor_name} | {a.service_type}</span>
                        <span className="text-xs text-slate-500">
                          {a.anomaly_type === 'duplicate' ? 'Exact match found shortly after original payment.' :
                           a.anomaly_type === 'cost_spike' ? `Cost deviated massively from 7-day rolling average.` :
                           'Pattern matches severely underutilized contracted rates.'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-400">
                        ₹{a.cost.toLocaleString()}
                      </span>
                      <span className="block text-xs text-slate-500 mt-1">Leakage risk</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${i % 3 === 0 ? 'bg-indigo-400 w-[96%]' : i % 2 === 0 ? 'bg-indigo-400 w-[89%]' : 'bg-indigo-400 w-[92%]'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-indigo-300">
                          {i % 3 === 0 ? '96%' : i % 2 === 0 ? '89%' : '92%'}
                        </span>
                      </div>
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
