"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, UserCheck, CheckCircle, XCircle, Play, Pause, ArrowRight, Activity, Clock } from "lucide-react";
import { formatINR } from "@/lib/formatINR";

export default function ActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApproval, setAutoApproval] = useState(true);

  const fetchActions = () => {
    fetch("/api/approve")
      .then((res) => res.json())
      .then((data) => {
        if (data?.actions) {
          setActions(data.actions.map((act: any) => ({
            ...act,
            entity_id: act.action_id || act.pk?.replace('ACTION#', '') || 'N/A',
            suggested_action: act.action_type || act.suggested_action || 'remediate',
            llm_explanation: act.reasoning || act.root_cause || act.recommendation || 'AI-identified cost optimization opportunity.',
            financial_impact: act.estimated_impact_inr || act.financial_impact || 0,
            status: act.status === 'pending' ? 'pending_approval' : act.status,
            confidence: act.confidence || 92,
            priority: act.priority || 'P3',
            run_id: data.run_id,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchActions();
    const interval = setInterval(fetchActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (action: any) => {
    setActions(actions.map(a => a.action_id === action.action_id ? { ...a, status: 'executed' } : a));
    try {
      await fetch(`/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.entity_id, run_id: action.run_id, decision: 'approved' })
      });
    } catch (e) { console.error(e) }
  };

  const handleReject = async (action: any) => {
    setActions(actions.map(a => a.action_id === action.action_id ? { ...a, status: 'rejected' } : a));
    try {
      await fetch(`/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: action.entity_id, run_id: action.run_id, decision: 'rejected' })
      });
    } catch (e) { console.error(e) }
  };

  const pendingCount = actions.filter(a => a.status === 'pending_approval').length;
  const executedCount = actions.filter(a => a.status === 'executed').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-8 selection:bg-blue-500/30">
      <main className="container mx-auto max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-blue-400 mb-4">
               <Zap className="h-5 w-5 fill-current" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Autonomous Remediation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
              AI Actions & <span className="text-white/60">HITL.</span>
            </h1>
            <p className="text-white/60 text-xl font-medium tracking-tight leading-relaxed">
              Control the autonomous boundary. CostIntel executes low-risk remediation instantly, 
              while high-impact decisions await executive human-in-the-loop (HITL) clearance.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-8 backdrop-blur-3xl min-w-[320px]">
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Orchestration Mode</p>
              <div className="flex items-center gap-2 font-black">
                {autoApproval ? <Activity className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-amber-500" />}
                <span className={autoApproval ? "text-green-400" : "text-amber-500"}>
                  {autoApproval ? "FULLY AUTONOMOUS" : "HITL ENFORCED"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setAutoApproval(!autoApproval)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${autoApproval ? 'bg-green-500' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoApproval ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Pending Queue */}
        <section className="mb-20">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <UserCheck className="h-6 w-6 text-amber-500" />
            Human Review Queue ({pendingCount})
          </h2>
          
          <div className="grid gap-6">
            <AnimatePresence>
            {pendingCount === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/[0.02] border border-white/5 border-dashed rounded-[2rem] p-16 text-center text-white/40"
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold tracking-tight">Queue Clear. No high-impact pending escalations.</p>
              </motion.div>
            ) : (
              actions.filter(a => a.status === 'pending_approval').map((act, i) => (
                <motion.div 
                  key={act.action_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:border-amber-500/30 transition-all backdrop-blur-md"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                        P1 ESCALATION
                      </span>
                      <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{act.entity_id}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                      Proposed: {act.suggested_action}
                    </h3>
                    <p className="text-lg text-white/60 mb-6 font-medium leading-relaxed italic">"{act.llm_explanation}"</p>
                    
                    <div className="flex items-center gap-10">
                      <div>
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-xl font-black text-blue-400">{act.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Impact Mitigation</p>
                        <p className="text-xl font-black text-green-400">₹{formatINR(act.financial_impact)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-10 min-w-[200px]">
                    <button 
                      onClick={() => handleApprove(act)}
                      className="w-full h-16 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(act)}
                      className="w-full h-16 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))
            )}
            </AnimatePresence>
          </div>
        </section>

        {/* Executed Log */}
        <section>
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <ShieldCheck className="h-6 w-6 text-white/60" />
            Autonomous Activity Log
          </h2>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-3xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-white/60 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="px-8 py-6">ID</th>
                  <th className="px-8 py-6">Action</th>
                  <th className="px-8 py-6">Risk</th>
                  <th className="px-8 py-6 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {actions.filter(a => a.status === 'executed' || a.status === 'rejected').slice(0, 10).map((act, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-mono text-[10px] text-white/40 tracking-widest uppercase">{act.entity_id}</td>
                    <td className="px-8 py-6 font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-tight">{act.suggested_action}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-white/50 uppercase border border-white/10 px-2 py-1 rounded-md">{act.priority || 'P3'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {act.status === 'executed' ? (
                        <span className="inline-flex items-center gap-2 text-green-400 font-black text-xs uppercase tracking-widest">
                           <CheckCircle className="h-4 w-4" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-white/60 font-black text-xs uppercase tracking-widest">
                          <XCircle className="h-4 w-4" /> REJECTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {executedCount === 0 && !loading && (
                  <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-white/30 uppercase tracking-widest">Log Empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
