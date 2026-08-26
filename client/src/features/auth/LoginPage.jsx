import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ShieldCheck, KeyRound, Mail, ArrowRight, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Official Brand Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-md bg-[#283733] border border-[#475853] items-center justify-center text-[#DBCEB1] mb-1 shadow-md">
            <Shield className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#283733] uppercase tracking-wider flex items-center justify-center gap-1">
            Satya<span className="text-[#475853]">Scan</span>
          </h1>
          <p className="text-xs font-semibold text-[#71807A] uppercase tracking-widest">
            Indian Border Security Checkpoint Terminal
          </p>
        </div>

        <Card className="border border-[#71807A]/30 bg-white shadow-md">
          <CardHeader className="border-b border-[#71807A]/20 pb-4">
            <CardTitle className="text-base font-extrabold uppercase tracking-wider text-[#283733]">
              Checkpoint Operator Authentication
            </CardTitle>
            <CardDescription className="text-xs text-[#71807A]">
              Sign in to your authorized border officer terminal session.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">
                  Operator Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#71807A]" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="officer@satyascan.local"
                    className="pl-9 bg-[#FCF5EE] border-[#71807A]/30 text-xs font-mono"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#B84A4A] font-semibold">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#283733]">
                  Security Access Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#71807A]" />
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-[#FCF5EE] border-[#71807A]/30 text-xs font-mono"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-[#B84A4A] font-semibold">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full py-5 text-sm uppercase tracking-wider font-extrabold bg-[#283733] hover:bg-[#475853]"
              >
                {isSubmitting ? "Authenticating Session..." : "Sign In Terminal"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-[#71807A]">
                Need account authorization?{" "}
                <Link to="/register" className="text-[#475853] hover:underline font-bold">
                  Account Provisioning Info
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Preset Helper */}
        <div className="p-4 rounded-md border border-[#71807A]/25 bg-[#FCF5EE] text-center space-y-2">
          <p className="text-xs font-bold text-[#283733] uppercase tracking-wider">Quick Test Credentials</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={fillAdmin}
              type="button"
              className="text-xs font-bold bg-[#283733] text-[#FDF6F0] px-3 py-1 rounded border border-[#475853]"
            >
              ADMIN
            </button>
            <button
              onClick={fillOfficer}
              type="button"
              className="text-xs font-bold bg-[#DBCEB1] text-[#283733] px-3 py-1 rounded border border-[#71807A]/40"
            >
              OFFICER
            </button>
            <button
              onClick={fillSubmitter}
              type="button"
              className="text-xs font-bold bg-white text-[#283733] px-3 py-1 rounded border border-[#71807A]/40"
            >
              SUBMITTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

