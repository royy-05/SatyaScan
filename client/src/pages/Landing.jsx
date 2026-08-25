import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  ShieldCheck,
  Cpu,
  UserCheck,
  Lock,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <ShieldCheck className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-100 tracking-tight">
                Satya<span className="text-cyan-400">Scan</span>
              </span>
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline-block">
                Ministry of Home Affairs / SSB
              </span>
            </div>
          </div>
          <Link to="/login">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6">
              Terminal Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SIH 2026 Problem Statement 26188</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
            SatyaScan: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Truth at the Border</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            AI-powered document and identity verification system for border checkpoints. Real-time multi-layer forensic analysis providing instant confidence scoring for passports, visas, and identification passes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base px-8 h-12 shadow-lg shadow-cyan-500/20">
                Access Official Control Portal
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Feature Strip */}
      <section className="py-16 px-6 border-y border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Explainable AI Analysis</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transparent per-layer forensic breakdown across optical character recognition, checksum validation, tampering detection, and face matching.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Human-in-the-Loop Workflow</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automated review queue routing for low-confidence or anomaly-flagged credentials, giving checkpoint officers final decision authority.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Sovereign & Compliant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built for Ministry of Home Affairs and Sashastra Seema Bal (SSB) requirements with full audit logging and offline air-gapped readiness.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-100">Multi-Layer Verification Flow</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From document submission to border officer decision in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: "01", title: "OCR Extraction", desc: "Reads MRZ data and textual fields", icon: FileCheck2 },
            { step: "02", title: "Checksum Validation", desc: "Verifies official document math", icon: CheckCircle2 },
            { step: "03", title: "Tampering Scan", desc: "Detects digital and physical edits", icon: Eye },
            { step: "04", title: "Biometric Face Match", desc: "Compares holder photo with face", icon: UserCheck },
            { step: "05", title: "Verdict Scoring", desc: "Generates PASS, REVIEW, or FAIL", icon: ShieldCheck },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-3 relative">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                  {item.step}
                </span>
                <div className="pt-2">
                  <IconComp className="h-6 w-6 text-slate-200 mb-2" />
                  <h4 className="font-bold text-slate-100 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-400">
        <p>SatyaScan System: Built for Ministry of Home Affairs / SSB Border Control (SIH 2026 Problem Statement 26188)</p>
      </footer>
    </div>
  );
}
