"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "Sim Lab", href: "/simulation" },
  { name: "AI Actions", href: "/actions" },
  { name: "Risks & Anomalies", href: "/anomalies" },
  { name: "Impact", href: "/sla" },
  { name: "Audit Trail", href: "/audit" },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/runs")
        .then(res => res.json())
        .then(data => {
          if (data.runs?.[0]) {
            setActiveScenario(data.runs[0].scenario || "Idle");
          }
        })
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 xl:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter text-white">
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Zap className="h-6 w-6 text-blue-400 fill-blue-400/20" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="leading-none whitespace-nowrap bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text font-black text-3xl">CostIntel</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold mt-0.5 hidden sm:block whitespace-nowrap">
                AI Orchestration
              </span>
            </div>
          </div>

          {activeScenario && (
            <div className="hidden 2xl:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 whitespace-nowrap">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest whitespace-nowrap">
                Scenario: {activeScenario.replace("_", " ")}
              </span>
            </div>
          )}
        </div>
        
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 xl:px-4 py-2 text-sm font-bold transition-all duration-300 rounded-xl whitespace-nowrap flex items-center justify-center ${
                  isActive 
                    ? "text-white bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
           <Link href="/simulation?autorun=true" className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-black rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.15)] active:scale-95 whitespace-nowrap">
             <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
             Launch Run
           </Link>
        </div>
      </div>
    </header>
  );
}
