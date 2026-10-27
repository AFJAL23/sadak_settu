"use client";

import { createClient } from "../lib/supabase/browser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkRecovery() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session && window.location.hash.includes("type=recovery")) {
        setMode("reset");
        setMessage("Enter your new password below.");
      }
    }
    checkRecovery();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setMessage("Enter your new password below.");
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function redirectByRole() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("Could not verify your account. Please log in again.");
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
    if (error || !profile) throw new Error("Profile not found. Please contact the administrator.");
    if (profile.role === "repair_department") router.replace("/dashboard/department");
    else if (profile.role === "monitoring_committee") router.replace("/dashboard/monitoring");
    else router.replace("/dashboard/citizen");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setMessage("If this email is registered, a password-reset link will be sent. Check your inbox and spam folder.");
      } else if (mode === "reset") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated successfully. You can now continue to your dashboard.");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Account request submitted. Check your email to verify your account before logging in.");
        } else {
          setMessage("Account created. Opening your dashboard...");
          await redirectByRole();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await redirectByRole();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const heading = mode === "signup" ? "Create citizen account" : mode === "forgot" ? "Forgot password?" : mode === "reset" ? "Set new password" : "Welcome back";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <a href="/" className="mb-5 inline-block text-sm text-emerald-400 hover:underline">← Back to Sadak-Settu</a>
        <p className="mb-2 text-sm font-semibold text-emerald-400">SADAK-SETTU</p>
        <h1 className="text-3xl font-bold">{heading}</h1>
        <p className="mb-6 mt-2 text-sm text-slate-400">
          {mode === "signup" ? "Create an account to report and track road complaints." : mode === "forgot" ? "Enter your registered email to receive a secure reset link." : mode === "reset" ? "Choose a new password for your account." : "Log in to access your account."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && <div><label htmlFor="fullName" className="mb-1 block text-sm">Full name</label><input id="fullName" autoComplete="name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Enter your full name" /></div>}
          {mode !== "reset" && <div><label htmlFor="email" className="mb-1 block text-sm">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="you@example.com" /></div>}
          {mode !== "forgot" && mode !== "reset" && <div><label htmlFor="password" className="mb-1 block text-sm">Password</label><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="At least 8 characters" /></div>}
          {mode === "reset" && <><div><label htmlFor="password" className="mb-1 block text-sm">New password</label><input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="At least 8 characters" /></div><div><label htmlFor="confirmPassword" className="mb-1 block text-sm">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Re-enter new password" /></div></>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">{loading ? "Please wait..." : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : mode === "reset" ? "Update Password" : "Log In"}</button>
        </form>
        {message && <p aria-live="polite" className="mt-4 break-words text-sm text-amber-300">{message}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-400">
          {mode === "login" && <><button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="font-semibold text-emerald-400 hover:underline">Forgot password?</button><button type="button" onClick={() => { setMode("signup"); setMessage(""); }} className="font-semibold text-emerald-400 hover:underline">Create citizen account</button></>}
          {mode === "signup" && <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className="font-semibold text-emerald-400 hover:underline">Already have an account? Log in</button>}
          {mode === "forgot" && <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className="font-semibold text-emerald-400 hover:underline">Back to login</button>}
          {mode === "reset" && <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className="font-semibold text-emerald-400 hover:underline">Back to login</button>}
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-500">Official accounts are administrator-managed. Creating a citizen account does not grant repair department or monitoring access.</p>
      </section>
    </main>
  );
}