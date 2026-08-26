import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
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
  Layers,
  FileSearch,
  Shield,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#283733] flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="bg-[#283733] text-[#FDF6F0] border-b border-[#475853] px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded bg-[#DBCEB1] flex items-center justify-center text-[#283733] shadow-sm">
              <Shield className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-[#FDF6F0] tracking-wider uppercase flex items-center gap-1">
                Satya<span className="text-[#DBCEB1]">Scan</span>
              </h1>
              <p className="text-[10px] font-semibold tracking-wider text-[#DBCEB1] uppercase">
                Ministry of Home Affairs / SSB Border Security Intelligence
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="gold" size="sm" className="font-bold px-5">
              Access Secure Terminal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-[#283733] text-[#FDF6F0] border-b border-[#475853] relative">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-[#DBCEB1]/40 bg-[#475853]/60 text-[#DBCEB1] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            <span>SIH 2026 Problem SIH26188 • Border Security Division</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FDF6F0] tracking-tight leading-tight">
            SatyaScan: AI-Powered Document & Identity Verification Platform
          </h1>

          <p className="text-base sm:text-lg text-[#FDF6F0]/80 max-w-3xl mx-auto font-sans leading-relaxed">
            Enterprise-grade document forensic intelligence and biometric verification designed for Indian border security checkpoints. Multi-layer optical character recognition, checksum math, tampering detection, and face matching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button variant="gold" size="lg" className="font-extrabold text-sm px-8 h-12">
                Access Official Checkpoint Terminal
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Multi-Layer Verification Pipeline Diagram */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold uppercase tracking-wider text-[#283733]">
            Forensic Inspection Pipeline
          </h2>
          <p className="text-xs text-[#71807A] max-w-xl mx-auto">
            Sequential AI verification layers evaluated before officer decision console.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: "01", title: "OCR Extraction", desc: "Extracts MRZ text & passport fields", icon: FileSearch },
            { step: "02", title: "Validation Math", desc: "Verifies ICAO 9303 checksums", icon: CheckCircle2 },
            { step: "03", title: "Tampering Analysis", desc: "ELA & copy-move SIFT inspection", icon: Layers },
            { step: "04", title: "Biometric Match", desc: "InsightFace facial cosine similarity", icon: UserCheck },
            { step: "05", title: "Risk & Review", desc: "PASS, REVIEW, or FAIL score", icon: ShieldCheck },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-md border border-[#71807A]/25 space-y-2 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-[#283733] bg-[#FCF5EE] border border-[#71807A]/20 px-2 py-0.5 rounded">
                  {item.step}
                </span>
                <div className="pt-1">
                  <IconComp className="h-5 w-5 text-[#475853] mb-1.5" />
                  <h3 className="font-bold text-[#283733] text-xs uppercase tracking-wide">{item.title}</h3>
                  <p className="text-[11px] text-[#71807A] mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Institutional Capability Cards */}
      <section className="py-16 px-6 bg-[#FCF5EE] border-t border-[#71807A]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-md border border-[#71807A]/25 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded bg-[#283733] text-[#DBCEB1] flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-[#283733]">Document Intelligence</h3>
            <p className="text-xs text-[#71807A] leading-relaxed">
              Automated optical character recognition and field parsing across Indian passports, entry visas, national IDs, and driving credentials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md border border-[#71807A]/25 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded bg-[#283733] text-[#DBCEB1] flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-[#283733]">Biometric Challenge</h3>
            <p className="text-xs text-[#71807A] leading-relaxed">
              4-step MediaPipe FaceMesh head rotation liveness tracking coupled with InsightFace cosine similarity match against document photos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-md border border-[#71807A]/25 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded bg-[#283733] text-[#DBCEB1] flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-[#283733]">Immutable Audit Trail</h3>
            <p className="text-xs text-[#71807A] leading-relaxed">
              Complete security event logging capturing every document submission, AI analysis layer result, and officer decision rationale.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#283733] text-[#FDF6F0] border-t border-[#475853] py-6 px-6 text-center text-xs">
        <p className="font-mono text-[#DBCEB1]">
          SatyaScan System Platform • Smart India Hackathon 2026 (SIH26188)
        </p>
      </footer>
    </div>
  );
}

