"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// Relative path used to prevent import resolution mismatches
import { createClient } from "../lib/supabase/browser";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

type Mode =
  | "login"
  | "signup"
  | "signup-otp"
  | "forgot"
  | "forgot-otp"
  | "reset";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [portalMode, setPortalMode] = useState<"citizen" | "official">("citizen");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "official") {
      setPortalMode("official");
      setMode("login");
    } else {
      setPortalMode("citizen");
    }
  }, [searchParams]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const redirectByRole = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw new Error("Unable to fetch your account role.");
    }

    if (!profile) {
      throw new Error(
        "Your profile was not found. Please contact the administrator."
      );
    }

    const role = String(profile.role || "").toLowerCase().trim();

    if (["department", "repair_department"].includes(role)) {
      router.replace("/dashboard/department");
    } else if (["monitoring", "monitoring_committee"].includes(role)) {
      router.replace("/dashboard/monitoring");
    } else if (role === "citizen") {
      router.replace("/dashboard/citizen");
    } else {
      throw new Error(`Your account role (${role || "none"}) is not recognized.`);
    }
  };

  // 1. EMAIL + PASSWORD LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Login failed. Please try again.");

      await redirectByRole(data.user.id);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // 2. CITIZEN SIGNUP (OTP BASED)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: name.trim(),
            role: "citizen",
          },
        },
      });

      if (error) throw error;

      setMode("signup-otp");
      setMessage("Verification OTP has been sent to your email address.");
    } catch (err: any) {
      setError(err.message || "Unable to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY SIGNUP OTP
  const handleSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });

      if (error) throw error;
      if (!data.user) throw new Error("OTP verification failed.");

      await redirectByRole(data.user.id);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP token.");
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD (OTP BASED)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) throw error;

      setMode("forgot-otp");
      setMessage("Password recovery OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 5. VERIFY RECOVERY OTP
  const handleRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "recovery",
      });

      if (error) throw error;

      setMode("reset");
      setMessage("OTP verified. Please set your new password.");
    } catch (err: any) {
      setError(err.message || "Invalid or expired recovery OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 6. UPDATE PASSWORD
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password successfully updated. You may now log in.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setMode("login");
    } catch (err: any) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode: Mode) => {
    clearMessages();
    setMode(nextMode);
    setOtp("");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400";

  const buttonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 shadow-md shadow-orange-600/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 selection:bg-orange-500 selection:text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 md:grid-cols-2">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white md:flex">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-tight">
              <span>सड़क</span>
              <span className="text-orange-500">-SETTU</span>
            </Link>

            <div className="mt-20">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 shadow-lg shadow-orange-600/40">
                <ShieldCheck size={32} />
              </div>

              <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                National Road <br />
                Grievance & Audit.
              </h1>

              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                A single digital bridge connecting citizens with district
                executing engineers and statutory quality monitoring bodies.
              </p>

              <div className="mt-8 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Direct GPS-enabled pothole documentation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>District isolation for repair accountability</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Double-check verification before ticket closure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-slate-800 pt-4">
            <p className="text-[11px] text-slate-400">
              Role-Based Access Control • MoRTH & Civic Framework
            </p>
          </div>
        </section>

        {/* RIGHT INTERACTIVE FORM PANEL */}
        <section className="p-7 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={14} />
                Back to Home
              </Link>

              {/* Portal Mode Indicator */}
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold">
                {portalMode === "citizen" ? (
                  <>
                    <UserRound size={13} className="text-orange-600" />
                    <span className="text-slate-700">Citizen Mode</span>
                  </>
                ) : (
                  <>
                    <Building2 size={13} className="text-emerald-600" />
                    <span className="text-slate-700">Official Portal</span>
                  </>
                )}
              </div>
            </div>

            {/* Portal Tab Switcher */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setPortalMode("citizen");
                  setMode("login");
                  clearMessages();
                }}
                className={`rounded-lg py-2 transition ${
                  portalMode === "citizen"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Citizen Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalMode("official");
                  setMode("login");
                  clearMessages();
                }}
                className={`rounded-lg py-2 transition ${
                  portalMode === "official"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Department / Monitor
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {mode === "login" &&
                  (portalMode === "citizen"
                    ? "Citizen Login"
                    : "Official Portal Sign In")}
                {mode === "signup" && "Register Citizen Account"}
                {mode === "signup-otp" && "Verify Email Address"}
                {mode === "forgot" && "Recover Account"}
                {mode === "forgot-otp" && "Verify Security Code"}
                {mode === "reset" && "Set New Password"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {mode === "login" &&
                  (portalMode === "citizen"
                    ? "Enter your credentials or use OTP sign up to access your dashboard."
                    : "Authorized personnel login for Road Repair & Quality Monitoring divisions.")}
                {mode === "signup" &&
                  "Enter your details. We will send a secure OTP to verify your email."}
                {mode === "signup-otp" && `Enter the 6-digit OTP sent to ${email}.`}
                {mode === "forgot" &&
                  "Enter your registered email to receive a recovery code."}
                {mode === "forgot-otp" &&
                  `Enter the security code delivered to ${email}.`}
                {mode === "reset" &&
                  "Choose a strong password with at least 6 characters."}
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-3.5 text-slate-400"
                      size={17}
                    />
                    <input
                      className={`${inputClass} pl-10`}
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-3.5 text-slate-400"
                      size={17}
                    />
                    <input
                      className={`${inputClass} pl-10 pr-11`}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => changeMode("forgot")}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Authenticating..." : "Sign In"}
                </button>

                {portalMode === "citizen" && (
                  <p className="text-center text-xs text-slate-500 pt-2">
                    New citizen?{" "}
                    <button
                      type="button"
                      onClick={() => changeMode("signup")}
                      className="font-bold text-orange-600 hover:underline"
                    >
                      Register via Email OTP
                    </button>
                  </p>
                )}
              </form>
            )}

            {/* 2. SIGNUP FORM (CITIZEN ONLY) */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Afjal Islam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="citizen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Sending Code..." : "Send Verification OTP"}
                </button>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="font-bold text-orange-600 hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              </form>
            )}

            {/* 3. SIGNUP OTP VERIFICATION */}
            {mode === "signup-otp" && (
              <form onSubmit={handleSignupOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Enter Verification OTP
                  </label>
                  <input
                    className={`${inputClass} tracking-widest text-center text-lg font-bold`}
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Verifying..." : "Verify & Open Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("signup")}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Change email address
                </button>
              </form>
            )}

            {/* 4. FORGOT PASSWORD REQUEST */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Registered Email Address
                  </label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Dispatching..." : "Send Recovery Code"}
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Return to Sign In
                </button>
              </form>
            )}

            {/* 5. RECOVERY OTP VERIFICATION */}
            {mode === "forgot-otp" && (
              <form onSubmit={handleRecoveryOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Recovery OTP
                  </label>
                  <input
                    className={`${inputClass} tracking-widest text-center text-lg font-bold`}
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Verifying..." : "Verify Recovery Code"}
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Resend or use another email
                </button>
              </form>
            )}

            {/* 6. PASSWORD RESET */}
            {mode === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    New Password
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button className={buttonClass} disabled={loading}>
                  {loading && <Loader2 className="animate-spin" size={17} />}
                  {loading ? "Updating..." : "Save Password & Login"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Sadak-Settu Civic Redressal Portal • Secure Auth Session
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <Loader2 className="animate-spin text-orange-600" size={32} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}