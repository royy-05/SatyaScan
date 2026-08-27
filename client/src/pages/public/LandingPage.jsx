import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Upload,
  ScanText,
  ShieldAlert,
  ScanFace,
  Fingerprint,
  UserCheck,
  FileSearch,
  Zap,
  Globe,
  Menu,
  X,
  CheckCircle2,
  Lock,
  Server,
  FileCheck,
} from "lucide-react";

import LogoImg from "../../assets/Logo.png";
import { HeroMockCard } from "./HeroMockCard";

// Helper component for Brand Logo with graceful fallback
function BrandLogo({ className = "h-9" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError && LogoImg) {
    return (
      <img
        src={LogoImg}
        alt="SatyaScan Logo"
        onError={() => setImgError(true)}
        className={`${className} w-auto object-contain`}
      />
    );
  }

  return (
    <div className="flex items-center space-x-2.5">
      <div className="h-9 w-9 rounded-lg bg-[#0FA891] flex items-center justify-center text-white shadow-sm font-extrabold text-lg">
        S
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
          Satya<span className="text-[#0FA891]">Scan</span>
        </span>
        <span className="text-[9px] font-semibold tracking-widest text-[#64748B] uppercase pt-0.5">
          Border Verification
        </span>
      </div>
    </div>
  );
}

// Counter component for animated counting stats
function StatCounter({ value, prefix = "", suffix = "", inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;

    const duration = 1500; // 1.5s total count up
    const stepTime = Math.max(16, Math.floor(duration / (end || 1)));

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// 1. STICKY TOP NAV
function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white border-b border-[#E2E8F0] shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <BrandLogo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#334155]">
          <a
            href="#how-it-works"
            className="hover:text-[#0FA891] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-[#0FA891] transition-colors"
          >
            Technology
          </a>
          <a
            href="#differentiation"
            className="hover:text-[#0FA891] transition-colors"
          >
            For Government
          </a>
          <a
            href="#faq"
            className="hover:text-[#0FA891] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Sign In & Register Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Link to="/register/submitter">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                className="text-[#334155] hover:text-[#0FA891] font-semibold px-4 rounded-lg transition-colors"
              >
                Register
              </Button>
            </motion.div>
          </Link>
          <Link to="/login/submitter">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="border-[#0FA891] text-[#0FA891] hover:bg-[#0FA891] hover:text-white font-semibold px-5 rounded-lg transition-colors"
              >
                Sign In
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#0F172A] hover:text-[#0FA891]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-b border-[#E2E8F0] px-6 py-4 space-y-3 shadow-lg"
        >
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#334155] hover:text-[#0FA891]"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#334155] hover:text-[#0FA891]"
          >
            Technology
          </a>
          <a
            href="#differentiation"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#334155] hover:text-[#0FA891]"
          >
            For Government
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#334155] hover:text-[#0FA891]"
          >
            FAQ
          </a>
          <div className="pt-2 space-y-2">
            <Link to="/login/submitter" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-semibold py-2.5">
                Sign In Terminal
              </Button>
            </Link>
            <Link to="/register/submitter" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-[#0FA891] text-[#0FA891] font-semibold py-2.5">
                Create Account
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

// 2. TRUST & STATS BAR WITH ANIMATED COUNTER
function TrustStatsBar() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const stats = [
    { prefix: "", value: 5, suffix: "", label: "Document Types Supported" },
    { prefix: "< ", value: 3, suffix: "s", label: "Average Verification Time" },
    { prefix: "", value: 4, suffix: "-Layer", label: "Forensic Analysis Pipeline" },
    { prefix: "", value: 100, suffix: "%", label: "Auditable Decisions" },
  ];

  return (
    <section ref={ref} className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className={`text-center space-y-1 ${idx !== 0 ? "pt-6 lg:pt-0" : ""}`}
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight font-mono">
              <StatCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                inView={inView}
              />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// 3. HOW IT WORKS SECTION
function HowItWorksSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload Document",
      desc: "Officer scans passport, visa, or national ID via the terminal.",
    },
    {
      step: "02",
      icon: ScanText,
      title: "OCR & Validation",
      desc: "EasyOCR extracts fields. Verhoeff or MRZ checksums validate authenticity.",
    },
    {
      step: "03",
      icon: ShieldAlert,
      title: "Tampering Detection",
      desc: "ELA, SIFT, and deep learning models detect edits, splices, and forgeries.",
    },
    {
      step: "04",
      icon: ScanFace,
      title: "Face Verification",
      desc: "InsightFace matches the traveler's live capture to the document photo.",
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            How SatyaScan Works
          </h2>
          <p className="text-lg text-[#334155] leading-relaxed">
            Four verification layers. Seconds per document. Full transparency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl hover:shadow-xl hover:border-[#0FA891] transition-all duration-300 h-full flex flex-col justify-between space-y-4 group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold font-mono text-[#0FA891]">
                        {item.step}
                      </span>
                      <div className="h-10 w-10 rounded-full bg-[rgba(15,168,145,0.08)] flex items-center justify-center text-[#0FA891] group-hover:bg-[#0FA891] group-hover:text-white transition-colors duration-300">
                        <IconComp className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#334155] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 4. FEATURES SECTION
function FeaturesSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const features = [
    {
      icon: Fingerprint,
      title: "Multi-Layer Forensics",
      desc: "OCR, format validation, tampering detection, and face biometrics combined into a single explainable risk score.",
    },
    {
      icon: UserCheck,
      title: "Human-in-the-Loop",
      desc: "AI handles routine cases. Officers focus on ambiguous submissions. Every decision recorded.",
    },
    {
      icon: FileSearch,
      title: "Explainable Verdicts",
      desc: "See exactly why each verdict was reached. Per-layer confidence, ELA heatmaps, and audit notes.",
    },
    {
      icon: ShieldCheck,
      title: "Tamper-Evident Audit",
      desc: "Every action logged with SHA-256 hashing and IP tracking. Chain of custody for investigations.",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      desc: "Under 3 seconds per document on production GPU. Live status updates via WebSocket.",
    },
    {
      icon: Globe,
      title: "5 Document Types",
      desc: "Aadhaar, Passport, PAN, Driving License, Voter ID. ICAO 9303 and Verhoeff standards.",
    },
  ];

  return (
    <section id="features" ref={ref} className="bg-[#F8FAFC] py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Built for Border Security
          </h2>
          <p className="text-lg text-[#334155] leading-relaxed">
            Not another KYC platform. A purpose-built system for India's border checkpoints.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl hover:shadow-xl hover:border-[#0FA891] transition-all duration-300 space-y-4 h-full group">
                  <div className="h-12 w-12 rounded-full bg-[rgba(15,168,145,0.08)] flex items-center justify-center text-[#0FA891] group-hover:bg-[#0FA891] group-hover:text-white transition-colors duration-300">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {feat.desc}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 5. NEW: TECHNOLOGY STACK SECTION
function TechStackSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const techLayers = [
    {
      title: "OCR Layer",
      tech: "EasyOCR + Verhoeff Algorithm + ICAO 9303 MRZ",
      desc: "Extracts identity fields across multilingual Indian IDs and passport machine-readable zones with mathematical checksum validation.",
      icon: ScanText,
    },
    {
      title: "Tampering Detection",
      tech: "OpenCV ELA + SIFT Copy-Move + PyTorch CNN",
      desc: "Performs Error Level Analysis, feature keypoint matching, and deep convolutional image inspection to flag pixel-level edits.",
      icon: ShieldAlert,
    },
    {
      title: "Face Biometrics",
      tech: "InsightFace buffalo_l + 512-dim embeddings",
      desc: "Extracts 512-dimensional facial embedding vectors to evaluate cosine similarity between live capture frames and document photos.",
      icon: ScanFace,
    },
    {
      title: "Infrastructure",
      tech: "FastAPI + Node.js + PostgreSQL + Socket.IO",
      desc: "High-concurrency Python AI engine coupled with Node.js REST APIs, relational audit databases, and real-time WebSocket pipelines.",
      icon: Server,
    },
  ];

  return (
    <section ref={ref} className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Built on Production-Grade Infrastructure
          </h2>
          <p className="text-lg text-[#334155] leading-relaxed">
            Open-source ML stack. Purpose-configured for Indian identity documents.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techLayers.map((layer, idx) => {
            const IconComp = layer.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <Card className="p-6 bg-white border border-[#E2E8F0] rounded-xl hover:shadow-xl hover:border-[#0FA891] transition-all duration-300 space-y-4 h-full flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-[rgba(15,168,145,0.08)] flex items-center justify-center text-[#0FA891] group-hover:bg-[#0FA891] group-hover:text-white transition-colors duration-300">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                      {layer.title}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-[#0FA891] bg-[rgba(15,168,145,0.08)] p-2 rounded border border-[#0FA891]/20">
                      {layer.tech}
                    </p>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      {layer.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 6. NEW: STANDARDS & COMPLIANCE BAND
function ComplianceBand() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const badges = [
    { label: "ICAO 9303", sub: "Passport Standard", icon: FileCheck },
    { label: "Verhoeff Math", sub: "UIDAI Aadhaar", icon: CheckCircle2 },
    { label: "SHA-256", sub: "Cryptographic Hashing", icon: Lock },
    { label: "JWT Session", sub: "Session Security", icon: Server },
    { label: "WCAG AA", sub: "Accessibility", icon: Zap },
    { label: "On-Premise", sub: "Data Sovereignty", icon: ShieldCheck },
  ];

  return (
    <section ref={ref} className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8 text-center">
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-mono font-bold uppercase tracking-widest text-[#64748B]"
        >
          Standards & Compliance
        </motion.h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, idx) => {
            const IconComp = badge.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center space-y-2 group cursor-default"
              >
                <div className="h-10 w-10 rounded-full bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center text-[#64748B] group-hover:text-[#0FA891] group-hover:border-[#0FA891] group-hover:bg-[rgba(15,168,145,0.06)] group-hover:scale-105 transition-all duration-300">
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-xs font-bold text-[#0F172A] font-mono group-hover:text-[#0FA891] transition-colors">
                    {badge.label}
                  </p>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                    {badge.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 7. DIFFERENTIATION SECTION
function DifferentiationSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const comparisons = [
    { label: "Focus", kyc: "Banking & fintech", satya: "Border security" },
    { label: "Ownership", kyc: "Foreign SaaS vendors", satya: "Government-owned" },
    { label: "Pricing", kyc: "Per-transaction fees", satya: "Fixed infrastructure" },
    { label: "Explainability", kyc: "Black-box scores", satya: "Per-layer breakdown" },
    { label: "Human review", kyc: "Optional add-on", satya: "Built-in by design" },
    { label: "Deployment", kyc: "Vendor cloud only", satya: "On-premise or air-gapped" },
  ];

  return (
    <section id="differentiation" ref={ref} className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Purpose-Built. Government-Owned. Explainable.
          </h2>
          <p className="text-lg text-[#334155] leading-relaxed">
            How SatyaScan differs from commercial KYC platforms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Comparison Table (Left 7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="grid grid-cols-3 bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 text-xs font-bold uppercase tracking-wider">
              <span className="text-[#64748B]">Feature</span>
              <span className="text-[#64748B]">Commercial KYC</span>
              <span className="text-[#0FA891]">SatyaScan</span>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {comparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 p-4 text-sm items-center">
                  <span className="font-semibold text-[#0F172A]">{row.label}</span>
                  <span className="text-[#64748B]">{row.kyc}</span>
                  <span className="font-bold text-[#0FA891] bg-[rgba(15,168,145,0.06)] py-1 px-2.5 rounded-md inline-block w-fit">
                    {row.satya}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stat Callout Card (Right 5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 space-y-6 text-center lg:text-left shadow-sm"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0FA891]">
                COST IMPACT AT SCALE
              </span>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] font-mono tracking-tight">
                ₹0 <span className="text-lg font-sans font-normal text-[#64748B]">/ verification</span>
              </h3>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              Commercial platforms charge ₹5 to ₹15 per verification. At SSB's scale, that is crores per year. SatyaScan is government infrastructure: fixed cost, unlimited use.
            </p>
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-center lg:justify-start space-x-2 text-xs font-semibold text-[#0F172A]">
              <ShieldCheck className="h-4 w-4 text-[#0FA891]" />
              <span>Full Data Sovereignty & Zero Vendor Lock-In</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// 8. NEW: FAQ SECTION
function FaqSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const [openIdx, setOpenIdx] = useState(0); // First item open by default

  const faqs = [
    {
      q: "Why not use commercial KYC platforms like Signzy or HyperVerge?",
      a: "Commercial KYC platforms are built for banking and fintech workflows. They charge per verification, run on foreign infrastructure, and cannot be deployed in air-gapped border environments. SatyaScan is purpose-built for Indian border security, government-owned, and deployable on-premise.",
    },
    {
      q: "How does human review work?",
      a: "The AI produces a verdict for every document: PASS, REVIEW, or FAIL. Only high-confidence PASS results are auto-cleared. Anything uncertain routes to a trained officer who makes the final decision. Every action is logged.",
    },
    {
      q: "What happens if the AI is wrong?",
      a: "We use defense-in-depth, five independent verification layers. If any layer is uncertain, the document routes to review. Officer decisions can override AI verdicts, and all overrides are logged with mandatory justification.",
    },
    {
      q: "Can this scale to all SSB border checkpoints?",
      a: "Yes. Architecture supports horizontal scaling, GPU inference pods, offline operation for remote posts, and multi-checkpoint deployments. Each checkpoint operates independently but shares audit trails for cross-checkpoint fraud detection.",
    },
    {
      q: "Is my data secure?",
      a: "All data stays on Indian soil. JWT-authenticated sessions, SHA-256 file hashing, tamper-evident audit logs, role-based access control, and encrypted database storage. Air-gapped deployment supported for sensitive posts.",
    },
    {
      q: "How is this different from Aadhaar eKYC?",
      a: "Aadhaar eKYC verifies a person's identity against UIDAI records, requiring licensing. SatyaScan verifies the authenticity of the physical document itself: detecting forgery, tampering, and format violations. Both approaches serve different security needs.",
    },
  ];

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" ref={ref} className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Common Questions
          </h2>
          <p className="text-lg text-[#334155] leading-relaxed">
            What border security teams ask us about SatyaScan.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between space-x-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="text-base font-bold text-[#0F172A]">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-[#0FA891]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6 pt-1 text-sm text-[#334155] leading-relaxed border-t border-[#E2E8F0]/60 bg-[#F8FAFC]/50"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 9. CTA SECTION
function CtaSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 px-6 bg-gradient-to-r from-[#0FA891] to-[#0D8F7B] text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Truth at the border.
        </h2>
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Login to your SatyaScan terminal and start verifying documents.
        </p>

        <div className="pt-4">
          <Link to="/login/submitter">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="bg-white text-[#0FA891] hover:bg-slate-50 font-extrabold text-base px-8 py-6 rounded-xl shadow-lg">
                Launch Terminal
                <ArrowRight className="ml-2 h-5 w-5 text-[#0FA891]" />
              </Button>
            </motion.div>
          </Link>
        </div>

        <p className="text-xs text-white/75 pt-6 font-mono max-w-xl mx-auto">
          Prototype system built for SIH 2026. Problem Statement 26188. Ministry of Home Affairs, Sashastra Seema Bal
        </p>
      </motion.div>
    </section>
  );
}

// 10. FOOTER
function LandingFooter() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <footer ref={ref} className="bg-[#0F172A] text-slate-300 py-16 px-6 border-t border-slate-800 text-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {/* Left Column */}
        <div className="space-y-4">
          <BrandLogo />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            SatyaScan: AI-powered document and identity verification for Indian border security.
          </p>
        </div>

        {/* Middle Column Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Technology Pipeline</a></li>
            <li><a href="#differentiation" className="hover:text-white transition-colors">Government Advantages</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            <li><Link to="/login/submitter" className="hover:text-[#0FA891] transition-colors">Terminal Login</Link></li>
          </ul>
          <p className="text-[11px] text-slate-500 pt-1">
            Officer or administrator? Use your provided sign-in URL.
          </p>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Institutional Ownership
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built for Smart India Hackathon 2026 (SIH26188). Designed for deployment across SSB border security checkpoints.
          </p>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <Lock className="h-3.5 w-3.5 text-[#0FA891]" />
            <span>Ministry of Home Affairs · SSB</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 SatyaScan. Built for Ministry of Home Affairs, Sashastra Seema Bal.</p>
        <p className="font-mono">SIH26188 Border Security Division</p>
      </div>
    </footer>
  );
}

// MAIN REDESIGNED LANDING PAGE
export function LandingPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#0FA891] selection:text-white flex flex-col">
      <TopNav />

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 bg-white min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Column (60% Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[rgba(15,168,145,0.08)] border border-[#0FA891]/20 text-[#0FA891] text-xs font-semibold">
              <span>🇮🇳 Built for Ministry of Home Affairs · SSB Border Security</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] tracking-tight leading-tight">
              AI-powered document verification for Indian border checkpoints.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#334155] leading-relaxed max-w-2xl">
              SatyaScan analyzes passports, visas, and national IDs in seconds. It detects tampering, verifies identity, and helps border officers make faster, evidence-based decisions.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/login/submitter">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full sm:w-auto bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-extrabold text-base px-8 h-13 rounded-xl shadow-md">
                    Launch Terminal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

              <a href="#how-it-works">
                <Button variant="ghost" className="w-full sm:w-auto text-[#334155] hover:text-[#0FA891] font-semibold text-base px-6 h-13">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-[#64748B] border-t border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4 text-[#0FA891]" />
                <span>5 Document Types</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-[#0FA891]" />
                <span>Real-time AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-[#0FA891]" />
                <span>Officer-verified</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (40% Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <HeroMockCard />
          </motion.div>
        </div>
      </section>

      {/* Trust & Stats Bar */}
      <TrustStatsBar />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Built for Border Security Features Section */}
      <FeaturesSection />

      {/* 5. NEW: Technology Stack Section */}
      <TechStackSection />

      {/* 6. NEW: Standards & Compliance Band */}
      <ComplianceBand />

      {/* Differentiation Section */}
      <DifferentiationSection />

      {/* 8. NEW: FAQ Section */}
      <FaqSection />

      {/* Call to Action Section */}
      <CtaSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
