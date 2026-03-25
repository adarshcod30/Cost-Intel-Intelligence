"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, UserCheck, CheckCircle, XCircle, AlertTriangle, Play, Pause } from "lucide-react";

export default function ActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApproval, setAutoApproval] = useState(true);

  const fetchActions = () => {
    // We fetch the latest run to get the actions
    fetch("/api/runs")
      .then((res) => res.json())
      .then((runData) => {
        if (runData.runs && runData.runs.length > 0) {
          const runId = runData.runs[0].run_id;
          return fetch(`/api/approve?run_id=${runId}`);
        }
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.actions) {
          setActions(data.actions.map((act: any) => ({
            ...act,
            entity_id: act.action_id,
            suggested_action: act.action_type,
            llm_explanation: act.root_cause || act.recommendation,
            financial_impact: act.estimated_impact_inr,
            status: act.status === 'pending' ? 'pending_approval' : act.status,
            confidence: act.confidence || 92
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchActions();
    const interval = setInterval(fetchActions, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (action: any) => {
    // Optimistic UI update
    setActions(actions.map(a => a.action_id === action.action_id ? { ...a, status: 'executed' } : a));
    try {
      await fetch(`/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.action_id, decision: 'approved' })
      });
    } catch (e) { console.error(e) }
  };

  const handleReject = async (action: any) => {
    setActions(actions.map(a => a.action_id === action.action_id ? { ...a, status: 'rejected' } : a));
    try {
      await fetch(`/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.action_id, decision: 'rejected' })
      });
    } catch (e) { console.error(e) }
  };

  const TopNav = () => (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
          CostIntel
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Overview</Link>
          <Link href="/actions" className="text-primary transition-colors border-b-2 border-primary py-5">AI Actions</Link>
          <Link href="/anomalies" className="text-muted-foreground hover:text-primary transition-colors">Risks & Anomalies</Link>
          <Link href="/sla" className="text-muted-foreground hover:text-primary transition-colors">Impact</Link>
          <Link href="/audit" className="text-muted-foreground hover:text-primary transition-colors">Audit Trail</Link>
        </nav>
      </div>
    </header>
  );

  const pendingCount = actions.filter(a => a.status === 'pending_approval').length;
  const executedCount = actions.filter(a => a.status === 'executed').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">AI Execution & Approvals</h1>
            <p className="text-slate-400 max-w-2xl">
              Control how the AI takes action. Low-risk operations execute automatically to save money instantly. 
              High-impact decisions are routed to humans for final review.
            </p>
          </div>
          
          {/* Approval Workflow Toggle */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-6 min-w-[300px]">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Workflow Mode</p>
              <div className="flex items-center gap-2 font-medium">
                {autoApproval ? <Play className="h-4 w-4 text-green-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
                <span className={autoApproval ? "text-green-400" : "text-amber-400"}>
                  {autoApproval ? "Fully Autonomous" : "Human-in-the-Loop"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setAutoApproval(!autoApproval)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoApproval ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoApproval ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Human in the Loop Pending Queue */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-400" />
            Human Review Required ({pendingCount})
          </h2>
          
          {pendingCount === 0 && !loading ? (
            <div className="bg-slate-900/30 border border-white/5 border-dashed rounded-xl p-8 text-center text-slate-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Inbox zero! No high-impact decisions waiting for your approval.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {actions.filter(a => a.status === 'pending_approval').map((act, i) => (
                <div key={i} className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-amber-500/20 rounded-xl p-5 shadow-lg flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                        {act.priority} - HIGH IMPACT
                      </span>
                      <span className="font-mono text-sm text-slate-400">{act.entity_id}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-100 mb-1">
                      AI Proposal: {act.suggested_action}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{act.llm_explanation || "Cost spike indicates massive resource underutilization. Remediation required immediately."}</p>
                    
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Confidence</p>
                        <p className="font-bold text-indigo-300">{act.confidence}% Correct</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Financial Impact</p>
                        <p className="font-bold text-red-400">₹{act.financial_impact?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <button 
                      onClick={() => handleApprove(act)}
                      className="flex-1 md:flex-none w-full px-6 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve Action
                    </button>
                    <button 
                      onClick={() => handleReject(act)}
                      className="flex-1 md:flex-none w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Executed Log */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Recently Executed by AI ({executedCount})
          </h2>
          
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Entity ID</th>
                  <th className="px-6 py-4 font-medium">Action Taken</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {actions.filter(a => a.status === 'executed' || a.status === 'rejected').slice(0, 10).map((act, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-300">{act.entity_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{act.suggested_action}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500 uppercase px-2 py-1 bg-slate-800 rounded">{act.priority || 'P3'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {act.status === 'executed' ? (
                        <div className="flex items-center gap-1.5 text-green-400 font-medium">
                          <CheckCircle className="h-4 w-4" /> Success / Blocked
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <XCircle className="h-4 w-4" /> Rejected
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {executedCount === 0 && !loading && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No actions executed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
