import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScanText, ShieldCheck, ShieldAlert, ScanFace, CheckCircle2 } from "lucide-react";

// CountUp number component for percentage values
function CountUpNumber({ target, duration = 1.2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) return;

    const totalMs = duration * 1000;
    const stepTime = Math.max(16, totalMs / (end || 1));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}%</>;
}

export function HeroMockCard() {
  const layers = [
    {
      name: "OCR",
      target: 95,
      icon: ScanText,
      color: "text-[#059669]",
      barColor: "bg-[#059669]",
    },
    {
      name: "Validation",
      target: 100,
      icon: ShieldCheck,
      color: "text-[#059669]",
      barColor: "bg-[#059669]",
    },
    {
      name: "Tampering",
      target: 12,
      icon: ShieldAlert,
      color: "text-[#059669]", // 12% is low/good tampering score
      barColor: "bg-[#059669]",
    },
    {
      name: "Face Match",
      target: 87,
      icon: ScanFace,
      color: "text-[#059669]",
      barColor: "bg-[#059669]",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative Radial Backdrop */}
      <div className="absolute -inset-4 bg-[rgba(15,168,145,0.12)] blur-2xl rounded-full pointer-events-none" />

      {/* Background Grid Pattern Accent */}
      <div className="absolute -top-6 -right-6 w-32 h-32 opacity-20 pointer-events-none bg-[radial-gradient(#0FA891_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Floating Animated Card Container */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xl space-y-5"
      >
        {/* 1. TOP BAR */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#DC2626]" />
            <div className="h-3 w-3 rounded-full bg-[#D97706]" />
            <div className="h-3 w-3 rounded-full bg-[#059669]" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#0F172A] ml-2">
              SATYASCAN TERMINAL
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[rgba(15,168,145,0.08)] border border-[#0FA891]/20">
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-2 w-2 rounded-full bg-[#059669]"
            />
            <span className="text-[10px] font-mono font-bold text-[#0FA891] uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* 2. MAIN CONTENT */}
        <div className="space-y-4">
          {/* ROW 1: Document + Scan Effect */}
          <div className="relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 overflow-hidden">
            {/* Top Bar for Card Section */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                INGESTED CREDENTIAL
              </span>

              {/* Pulsing OCR Badge */}
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[rgba(15,168,145,0.1)] border border-[#0FA891]/30">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1.5 w-1.5 rounded-full bg-[#0FA891]"
                />
                <span className="text-[10px] font-mono font-bold text-[#0FA891]">
                  OCR ACTIVE
                </span>
              </div>
            </div>

            {/* CSS Rendered Mock Aadhaar Card (280px wide) */}
            <div className="relative w-[280px] sm:w-[320px] mx-auto bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden text-left">
              {/* Orange Top Bar */}
              <div className="bg-[#F97316] text-white text-[9px] font-bold px-3 py-1 flex items-center justify-between uppercase tracking-wider">
                <span>Government of India</span>
                <span>भारत सरकार</span>
              </div>

              {/* Card Body */}
              <div className="p-3 flex items-start space-x-3">
                {/* Photo Placeholder */}
                <div className="h-14 w-12 rounded bg-slate-100 border border-slate-300 flex-shrink-0 flex items-center justify-center text-slate-400">
                  <ScanFace className="h-7 w-7 text-[#0FA891]" />
                </div>

                {/* Details */}
                <div className="space-y-0.5 text-[11px] font-sans">
                  <p className="text-[#0F172A] font-extrabold tracking-tight">
                    SOUPARNO SARKAR
                  </p>
                  <p className="text-[#334155] text-[10px]">
                    DOB: <span className="font-semibold text-[#0F172A]">26/04/2005</span>
                  </p>
                  <p className="text-[#334155] text-[10px]">
                    GENDER: <span className="font-semibold text-[#0F172A]">MALE</span>
                  </p>
                </div>
              </div>

              {/* Bottom Doc Number */}
              <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-3 py-1.5 text-center">
                <span className="font-mono text-xs font-bold text-[#0F172A] tracking-wider">
                  9896 2165 0648
                </span>
              </div>

              {/* Animated Horizontal Scan Line Overlay */}
              <motion.div
                animate={{ y: [0, 110, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0FA891] to-transparent shadow-[0_0_10px_#0FA891] pointer-events-none z-10"
              />
            </div>
          </div>

          {/* ROW 2: Layer Analysis Grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#64748B] uppercase">
              FORENSIC ANALYSIS
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {layers.map((layer, idx) => {
                const IconComp = layer.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.15 }}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-3 space-y-2 shadow-xs hover:border-[#0FA891]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <IconComp className="h-3.5 w-3.5 text-[#0FA891]" />
                        <span className="text-xs font-bold text-[#0F172A]">
                          {layer.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-[#059669]">
                        <CountUpNumber target={layer.target} duration={1.2 + idx * 0.2} />
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${layer.target}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.15, ease: "easeOut" }}
                        className={`h-full rounded-full ${layer.barColor}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM VERDICT BAR */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-2.5 z-10">
            <ShieldCheck className="h-5 w-5 text-white" />
            <span className="font-extrabold text-sm uppercase tracking-wider text-white">
              VERIFIED PASS
            </span>
          </div>

          <span className="font-mono text-xs font-bold bg-white/20 px-2.5 py-1 rounded tracking-wide z-10">
            98.4% CONFIDENCE
          </span>

          {/* Shine Sweep Animation */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default HeroMockCard;
