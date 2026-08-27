import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "./api";
import { useAuth } from "../../hooks/useAuth";
import { setAccessToken } from "../../api/client";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Mail, KeyRound, User, Phone, FileText, Lock, ArrowRight, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import LogoImg from "../../assets/Logo.png";
import { HeroMockCard } from "../../pages/public/HeroMockCard";

const submitterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms of service" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const officerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    contactNumber: z.string().min(8, "Contact number is required"),
    registrationReason: z.string().min(20, "Reason must be at least 20 characters long"),
    inviteCode: z.string().min(1, "Invitation code is required"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms of service" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function RegisterPage({ role = "SUBMITTER" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const isOfficer = role === "OFFICER";
  const currentSchema = isOfficer ? officerSchema : submitterSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      contactNumber: "",
      registrationReason: "",
      inviteCode: "",
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      if (isOfficer) {
        await authApi.registerOfficer({
          name: data.name,
          email: data.email,
          password: data.password,
          contactNumber: data.contactNumber,
          registrationReason: data.registrationReason,
          inviteCode: data.inviteCode,
        });
        setSubmittedSuccess(true);
      } else {
        const res = await authApi.registerSubmitter({
          name: data.name,
          email: data.email,
          password: data.password,
        });

        const { accessToken, refreshToken, user } = res.data;
        setAccessToken(accessToken);
        localStorage.setItem("satya_refresh_token", refreshToken);
        setUser(user);
        toast.success("Welcome to SatyaScan!");
        navigate("/app/dashboard");
      }
    } catch (err) {
      if (err?.code === "INVALID_INVITE_CODE") {
        setServerError("Invalid invitation code. Please contact your administrator for the correct code.");
      } else {
        setServerError(err?.message || "Registration failed. Please try again.");
      }
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
              {isOfficer
                ? "Official registration portal for authorized border review officers."
                : "Create your submitter account to process identity documents."}
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

      {/* RIGHT FORM PANEL */}
      <div className="w-full lg:w-1/2 bg-white p-8 lg:p-16 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Confirmation Screen for Officer Registration */}
          {submittedSuccess ? (
            <div className="space-y-6 text-center py-8">
              <div className="h-16 w-16 bg-[#0FA891]/10 text-[#0FA891] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#0F172A]">Registration Submitted</h2>
                <p className="text-sm text-[#334155] leading-relaxed">
                  Your officer registration has been submitted for administrator approval. You will not be able to sign in until your account is approved. This typically takes 24 to 48 hours.
                </p>
              </div>
              <Link to="/login/officer">
                <Button className="w-full bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold py-3 rounded-xl mt-4">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                  {isOfficer ? "Request Officer Access" : "Create Submitter Account"}
                </h2>
                <p className="text-sm text-[#334155]">
                  {isOfficer
                    ? "Officer accounts require administrator approval before activation."
                    : "Register for a submitter account to upload documents."}
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800 text-xs leading-relaxed">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <Input
                      {...register("name")}
                      placeholder="Vikram Singh"
                      className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="officer@satyascan.local"
                      className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Officer Extra Fields: Contact Number */}
                {isOfficer && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                      <Input
                        {...register("contactNumber")}
                        placeholder="+91 98765 43210"
                        className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="text-xs text-red-600 font-medium">{errors.contactNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Officer Extra Fields: Reason for Access */}
                {isOfficer && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Reason for Access
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                      <textarea
                        {...register("registrationReason")}
                        rows={3}
                        placeholder="Please describe your role and why you need officer access."
                        className="w-full pl-10 pt-2.5 pr-3 bg-white border border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-[#0FA891] text-sm"
                      />
                    </div>
                    {errors.registrationReason && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.registrationReason.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Officer Extra Fields: Invitation Code */}
                {isOfficer && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Invitation Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                      <Input
                        {...register("inviteCode")}
                        placeholder="Provided by your administrator"
                        className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm font-mono"
                      />
                    </div>
                    {errors.inviteCode && (
                      <p className="text-xs text-red-600 font-medium">{errors.inviteCode.message}</p>
                    )}
                  </div>
                )}

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                      <Input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-white border-slate-300 text-[#0F172A] font-semibold placeholder:text-slate-400 focus:border-[#0FA891] text-sm"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("terms")}
                      className="rounded border-slate-300 text-[#0FA891] focus:ring-[#0FA891]"
                    />
                    <span className="text-xs text-[#334155]">
                      I agree to SatyaScan's terms of service.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-red-600 font-medium pt-1">{errors.terms.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#0FA891] hover:bg-[#0D8F7B] text-white font-bold text-sm rounded-xl shadow-sm transition-all mt-2"
                >
                  {isSubmitting ? "Submitting..." : isOfficer ? "Submit Officer Registration" : "Create Submitter Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {/* Bottom Link */}
              <div className="pt-2 text-xs text-center text-[#64748B]">
                Already have an account?{" "}
                <Link
                  to={isOfficer ? "/login/officer" : "/login/submitter"}
                  className="text-[#0FA891] font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
