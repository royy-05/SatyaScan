import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ShieldCheck, KeyRound, Mail, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
    try {
      await login(data.email, data.password);
      navigate("/app/dashboard");
    } catch (_err) {
      // Error handled by axios interceptor toast
    }
  };

  const fillAdmin = () => {
    setValue("email", "admin@satyascan.local");
    setValue("password", "Admin@123");
  };

  const fillOfficer = () => {
    setValue("email", "officer@satyascan.local");
    setValue("password", "Officer@123");
  };

  const fillSubmitter = () => {
    setValue("email", "submitter@satyascan.local");
    setValue("password", "Submitter@123");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Badge Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-400 mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Satya<span className="text-cyan-400">Scan</span> Terminal
          </h1>
          <p className="text-xs text-slate-400">Ministry of Home Affairs / SSB Official Login</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Checkpoint Authentication</CardTitle>
            <CardDescription>Sign in to your authorized officer account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="officer@satyascan.local"
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-400">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                {isSubmitting ? "Authenticating..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-400">
                Need an account?{" "}
                <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
                  Register Information
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Preset Helper */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-300">Quick Test Credentials</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={fillAdmin}
              type="button"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-1 rounded border border-slate-700"
            >
              Admin
            </button>
            <button
              onClick={fillOfficer}
              type="button"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded border border-slate-700"
            >
              Officer
            </button>
            <button
              onClick={fillSubmitter}
              type="button"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2.5 py-1 rounded border border-slate-700"
            >
              Submitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
