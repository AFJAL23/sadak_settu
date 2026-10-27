"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Construction,
  FileText,
  Home,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/browser";

type RoadReport = {
  id: string;
  complaint_id: string;
  damage_type: string;
  description: string | null;
  urgency: string;
  address: string | null;
  status: string;
  created_at: string;
};

const statusLabel = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("resolv") || s.includes("complet")) return "Resolved";
  if (s.includes("progress") || s.includes("repair")) return "In Progress";
  return "Submitted";
};

export default function CitizenDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      setEmail(auth.user.email ?? "");

      const { data, error } = await supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, status, created_at"
        )
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setReports([]);
        setMessage(
          "Reports could not be loaded. Please check the report ownership column and database permissions."
        );
        return;
      }

      setReports(data ?? []);
    } catch {
      setReports([]);
      setMessage("Something went wrong while loading your reports.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Logout failed. Please try again.");
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const submitted = reports.filter(
    (r) => statusLabel(r.status) === "Submitted"
  ).length;
  const inProgress = reports.filter(
    (r) => statusLabel(r.status) === "In Progress"
  ).length;
  const resolved = reports.filter(
    (r) => statusLabel(r.status) === "Resolved"
  ).length;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "How It Works", href: "/#how-it-works", icon: Activity },
    { label: "Features", href: "/#features", icon: ShieldCheck },
    { label: "Road Milestones", href: "/#road-milestones", icon: Construction },
    { label: "My Complaints", href: "#my-complaints", icon: ClipboardList },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Construction size={25} />
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">
                Sadak-<span className="text-orange-600">Settu</span>
              </span>
              <span className="block text-xs text-slate-500">
                Better Roads, Better Connectivity
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-orange-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="max-w-44 text-right">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="truncate text-sm font-semibold">{email || "Citizen"}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              <LogOut size={16} />
              {signingOut ? "Signing out..." : "Logout"}
            </button>
          </div>

          <button
            aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileMenu((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 lg:hidden"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-orange-50 hover:text-orange-700"
                >
                  <item.icon size={18} />
                  {item.label}
                </a>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                CITIZEN SERVICES PORTAL
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your Voice. <span className="text-orange-400">Better Roads.</span>
              </h1>
              <p className="mt-3 max-w-xl leading-7 text-slate-300">
                Welcome back! Report damaged roads, keep track of your complaints,
                and stay informed about their progress.
              </p>
              <p className="mt-3 truncate text-sm text-slate-400">
                Signed in as {email || "Citizen"}
              </p>
            </div>

            <Link
              href="/report"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400"
            >
              <Construction size={20} />
              Report Road Damage
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Reports",
              count: reports.length,
              icon: ClipboardList,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Submitted",
              count: submitted,
              icon: Bell,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              title: "In Progress",
              count: inProgress,
              icon: Clock3,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              title: "Resolved",
              count: resolved,
              icon: CheckCircle2,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={23} />
                </span>
                <span className="text-3xl font-extrabold tabular-nums">
                  {loading ? "—" : stat.count}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {stat.title}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <Link
            href="/report"
            className="group flex items-start gap-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm transition hover:border-orange-400 hover:shadow-md"
          >
            <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Construction size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">Report Road Damage</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Submit a pothole or damaged-road complaint with details.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600">
                Submit a report <ArrowRight size={16} />
              </span>
            </span>
          </Link>

          <a
            href="#my-complaints"
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ClipboardList size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">Track My Complaints</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Review your complaint IDs and current repair status.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                View complaints <ArrowRight size={16} />
              </span>
            </span>
          </a>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck size={24} />
            </span>
            <span>
              <span className="block font-bold">Your Reports, Your Updates</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Check your reports here as repair progress is recorded.
              </span>
            </span>
          </div>
        </section>

        <section id="my-complaints" className="mt-10 scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                Your activity
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                My Road Complaints
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                View your submitted complaints and their latest status.
              </p>
            </div>

            <button
              onClick={() => void loadReports()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {message && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              <RefreshCw className="mx-auto mb-3 animate-spin" size={24} />
              Loading your complaints...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FileText size={27} />
              </span>
              <h3 className="mt-4 text-lg font-bold">No complaints yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Once you submit a road damage report, its complaint ID and
                progress will appear here.
              </p>
              <Link
                href="/report"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Submit Your First Report <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const status = statusLabel(report.status);
                const statusStyle =
                  status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : status === "In Progress"
                      ? "bg-blue-50 text-blue-700 ring-blue-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200";

                return (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Complaint ID
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-orange-600">
                          {report.complaint_id}
                        </p>
                        <h3 className="mt-2 text-lg font-bold">
                          {report.damage_type}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusStyle}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {status}
                      </span>
                    </div>

                    <p className="mt-4 leading-6 text-slate-600">
                      {report.description || "No additional description provided."}
                    </p>

                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:grid-cols-3">
                      <p className="flex items-start gap-2">
                        <MapPin size={17} className="mt-0.5 shrink-0" />
                        <span>{report.address || "Location not provided"}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Activity size={17} className="shrink-0" />
                        Urgency: {report.urgency}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 size={17} className="shrink-0" />
                        {new Date(report.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs leading-6 text-slate-500">
          <p>© 2026 Sadak-Settu. Better Roads, Better Connectivity.</p>
          <p>A civic reporting platform. Not an official Government of India website.</p>
        </footer>
      </div>
    </main>
  );
}
