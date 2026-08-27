import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Mail, KeyRound, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import LogoImg from "../../assets/Logo.png";
import { HeroMockCard } from "../../pages/public/HeroMockCard";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage({ role = "SUBMITTER" }) {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [inlineError, setInlineError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setInlineError("");
    try {
      const userData = await login(data.email, data.password);

      // Verify user role matches the route's role requirement
      if (userData.role !== role) {
        toast.error(`This login is for ${role} accounts. Please use the correct sign-in page.`);
        await logout();
        return;
      }

      navigate("/app/dashboard");
    } catch (err) {
      if (err?.code === "PENDING_APPROVAL") {
        setInlineError("Your account is awaiting administrator approval. Please check back later.");
      } else if (err?.code === "REGISTRATION_REJECTED") {
        setInlineError("Your account registration was not approved. Contact your administrator.");
      }
      // General credentials errors are handled by toast interceptor
    }
  };

  const handleQuickFill = () => {
    if (role === "ADMIN") {
      setValue("email", "admin@satyascan.local");
      setValue("password", "Admin@123");
    } else if (role === "OFFICER") {
      setValue("email", "officer@satyascan.local");
      setValue("password", "Officer@123");
    } else {
      setValue("email", "submitter@satyascan.local");
      setValue("password", "Submitter@123");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans antialiased text-[#0F172A]">
      {/* LEFT BRAND PANEL (50% Width Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] text-white px-8 py-8 xl:px-12 xl:py-10 flex-col justify-between relative overflow-hidden">
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0FA891_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Section 1: Brand Header */}
        <div className="relative z-10 space-y-3">
          <Link to="/" className="inline-block">
            {LogoImg ? (
              <img src={LogoImg} alt="SatyaScan Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-lg bg-[#0FA891] flex items-center justify-center font-extrabold text-xl">
                  S
                </div>
                <span className="font-extrabold text-2xl tracking-tight">
                  Satya<span className="text-[#0FA891]">Scan</span>
                </span>
              </div>
            )}
          </Link>
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-[#0FA891]">
              <Shield className="h-3.5 w-3.5" />
              <span>Ministry of Home Affairs · SSB Border Security</span>
            </div>
          </div>
        </div>

        {/* Section 2: Tagline block + Section 3: Animated Verification Card */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center">
          {/* Tagline block */}
          <div className="space-y-1.5 text-left w-full mb-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
              Truth at the border.
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              AI-powered document verification for Indian border security.
            </p>
          </div>

          {/* HeroMockCard Wrapper with responsive CSS scaling */}
          <div className="w-full max-w-md mx-auto my-2 flex justify-center items-center transform scale-[0.85] xl:scale-[0.9] origin-top">
            <HeroMockCard />
          </div>
        </div>

        {/* Section 4: Footer text */}
        <div className="relative z-10 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
          Prototype for SIH 2026 · MHA · SSB
        </div>
      </div>

      {/* RIGHT FORM PANEL (50% Width Desktop) */}
      <div className="w-full lg:w-1/2 bg-white p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header Title based on Role */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              {role === "SUBMITTER" && "Submitter Sign In"}
              {role === "OFFICER" && "Officer Sign In"}
              {role === "ADMIN" && "Administrator Sign In"}
            </h2>
            <p className="text-sm text-[#334155]">
              {role === "SUBMITTER" && "Access your document submission terminal"}
              {role === "OFFICER" && "Access your review terminal"}
              {role === "ADMIN" && "System administration access"}
            </p>
          </div>

          {/* Inline Error Notice */}
          {inlineError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-800 text-xs leading-relaxed">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{inlineError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={
                    role === "ADMIN"
                      ? "admin@satyascan.local"
                      : role === "OFFICER"
                      ? "officer@satyascan.local"
                      : "submitter@satyascan.local"
                  }
                  className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold text-sm rounded-xl shadow-sm transition-all"
            >
              {isSubmitting ? "Authenticating..." : `Sign In as ${role}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Links Section based on Role */}
          <div className="space-y-3 pt-2 text-xs text-center text-[#64748B]">
            {role === "SUBMITTER" && (
              <div>
                Don't have an account?{" "}
                <Link to="/register/submitter" className="text-[#0FA891] font-semibold hover:underline">
                  Register here
                </Link>
              </div>
            )}

            {role === "OFFICER" && (
              <>
                <div>
                  <Link to="/register/officer" className="text-[#0FA891] font-semibold hover:underline">
                    Request officer access
                  </Link>
                </div>
                <p className="text-[11px] text-[#64748B] italic">
                  Officer accounts require administrator approval before activation.
                </p>
                <div className="pt-1">
                  <Link to="/login/submitter" className="text-[#64748B] hover:text-[#0F172A] underline">
                    Sign in as submitter
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Dev-only Quick Test Credentials */}
          {import.meta.env.DEV && (
            <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-center space-y-2 mt-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                Dev Helper: Fill Test {role} Credentials
              </span>
              <div>
                <Button
                  type="button"
                  onClick={handleQuickFill}
                  variant="outline"
                  className="text-xs font-mono border-[#0FA891] text-[#0FA891] hover:bg-[#0FA891] hover:text-white"
                >
                  Fill {role} Test Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
