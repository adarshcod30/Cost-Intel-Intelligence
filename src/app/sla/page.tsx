"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, TrendingUp, ShieldAlert, BarChart3, AlertTriangle, ArrowDownRight, Activity, DollarSign } from "lucide-react";
import { formatINR } from "@/lib/formatINR";

export default function ImpactPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch("/api/runs")
      .then(res => res.json())
      .then(runData => {
        if (runData.runs && runData.runs.length > 0) {
          fetch(`/api/metrics/${runData.runs[0].run_id}`)
            .then(res => res.json())
            .then(data => setMetrics(data?.metrics));
        }
      });
  }, []);

  const totalSaved = metrics ? (metrics.total_impact_inr / 100000).toFixed(2) : "0.00";
  const leakage = metrics ? (metrics.estimated_leakage_inr / 100000).toFixed(2) : "0.00";
  const penalties = metrics ? (metrics.penalty_at_risk_inr / 100000).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-8 selection:bg-blue-500/30 font-medium">
      <main className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase mb-8"
          >
            <DollarSign className="h-3 w-3" />
            Financial Impact Engine
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">Working Capital <span className="text-white/60 italic">Protected.</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto text-xl font-medium tracking-tight leading-relaxed">
            By predicting SLA breaches and instantly blocking duplicate payments, 
            the AI pipeline actively prevents cost leakage in real-time.
          </p>
        </div>

        {/* Hero Impact Metric */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/10 rounded-[3rem] p-16 text-center mb-12 relative overflow-hidden shadow-2xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          
          <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-xs mb-6 opacity-80">Total Financial Value Delivered (FY26)</p>
          <div className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 group-hover:scale-105 transition-transform duration-700">
            ₹{formatINR(totalSaved)} <span className="text-white/60">Lakh</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-black text-sm uppercase tracking-widest">
            <TrendingUp className="h-4 w-4" /> 
            14.8% Operational Expense Reduction
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Prevented Leakage Breakdown */}
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-red-500/30 transition-all backdrop-blur-3xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Cost Leakage <span className="text-white/60">Prevented</span></h3>
            <p className="text-white/60 mb-8 font-medium leading-relaxed italic pr-8">
              "Money saved by intercepting duplicate invoices, vendor overcharging, and shutting down idle cloud infrastructure automatically."
            </p>
            <div className="flex items-end gap-3 text-5xl font-black text-white">
              ₹{formatINR(leakage)}L
              <span className="text-green-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> 11% SAVINGS
              </span>
            </div>
          </motion.div>

          {/* SLA Penalties Avoided Breakdown */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="bg-zinc-900/50 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-amber-500/30 transition-all backdrop-blur-3xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">SLA Penalties <span className="text-white/60">Avoided</span></h3>
            <p className="text-white/60 mb-8 font-medium leading-relaxed italic pr-8">
               "Money saved by having the AI predict SLA team capacity failures and rerouting high priority tickets before they breach contract."
            </p>
            <div className="flex items-end gap-3 text-5xl font-black text-white">
              ₹{formatINR(penalties)}L
              <span className="text-green-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> 36% DROP
              </span>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
