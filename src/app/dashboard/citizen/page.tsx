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
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
  Eye,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { createClient } from "../../lib/supabase/browser";

type RoadReport = {
  id: string;
  complaint_id: string;
  damage_type: string;
  description: string | null;
  urgency: string;
  address: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_path: string | null;
  repaired_photo_path?: string | null;
  repair_cost?: number | null;
  repair_notes?: string | null;
  monitoring_notes?: string | null;
  status: string;
  created_at: string;
};

// Flipkart-style 4-stage tracking status logic
const getTrackingStage = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s.includes("resolv") || s.includes("complet") || s.includes("approv")) {
    return {
      stage: 4,
      title: "Resolved & Approved",
      badgeColor: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dotColor: "bg-emerald-500",
    };
  }
  if (s.includes("rework") || s.includes("reject")) {
    return {
      stage: 2,
      isRework: true,
      title: "Rework Ordered",
      badgeColor: "bg-rose-50 text-rose-700 ring-rose-200",
      dotColor: "bg-rose-500",
    };
  }
  if (s.includes("monitor") || s.includes("review") || s.includes("audit") || s.includes("verif")) {
    return {
      stage: 3,
      title: "Under Quality Audit",
      badgeColor: "bg-purple-50 text-purple-700 ring-purple-200",
      dotColor: "bg-purple-500",
    };
  }
  if (s.includes("progress") || s.includes("repair")) {
    return {
      stage: 2,
      title: "Repair In Progress",
      badgeColor: "bg-blue-50 text-blue-700 ring-blue-200",
      dotColor: "bg-blue-500",
    };
  }
  return {
    stage: 1,
    title: "Grievance Registered",
    badgeColor: "bg-amber-50 text-amber-700 ring-amber-200",
    dotColor: "bg-amber-500",
  };
};

export default function CitizenDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [searchRef, setSearchRef] = useState("");
  const [selectedReport, setSelectedReport] = useState<RoadReport | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.replace("/login?mode=citizen");
        return;
      }

      setEmail(auth.user.email ?? "");

      const { data, error } = await supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, district, latitude, longitude, photo_path, repaired_photo_path, repair_cost, repair_notes, monitoring_notes, status, created_at"
        )
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setReports([]);
        setMessage("Unable to load grievances. Please ensure database permissions and policies are applied.");
        return;
      }

      setReports(data ?? []);
    } catch {
      setReports([]);
      setMessage("An unexpected error occurred while loading your complaint records.");
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
      setMessage("Logout failed. Please retry.");
      setSigningOut(false);
      return;
    }

    router.replace("/login?mode=citizen");
    router.refresh();
  }

  // Filter complaints based on Search Input (Reference ID or District)
  const filteredReports = reports.filter((r) => {
    const q = searchRef.toLowerCase().trim();
    if (!q) return true;
    return (
      r.complaint_id.toLowerCase().includes(q) ||
      (r.district && r.district.toLowerCase().includes(q)) ||
      r.damage_type.toLowerCase().includes(q)
    );
  });

  const registeredCount = reports.filter(
    (r) => getTrackingStage(r.status).stage === 1
  ).length;
  const inProgressCount = reports.filter((r) =>
    [2, 3].includes(getTrackingStage(r.status).stage)
  ).length;
  const resolvedCount = reports.filter(
    (r) => getTrackingStage(r.status).stage === 4
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
              <Construction size={22} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">
                सड़क<span className="text-orange-600">-SETTU</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                Citizen Grievance Redressal
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400">Signed in citizen</p>
              <p className="max-w-[200px] truncate text-xs font-bold text-slate-800">
                {email || "Citizen User"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-60"
            >
              <LogOut size={14} />
              {signingOut ? "Exiting..." : "Sign Out"}
            </button>
          </div>

          <button
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenu((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white p-4 lg:hidden">
            <div className="mb-3 border-b border-slate-100 pb-2">
              <p className="text-[11px] text-slate-400">Signed in citizen</p>
              <p className="truncate text-xs font-bold text-slate-800">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg py-2 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                CITIZEN ACTION CONSOLE
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Active Road Grievances & Live Audit
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Each complaint submitted here is directly mapped to your district road repair
                division and audited by an independent monitoring committee.
              </p>
            </div>

            <Link
              href="/report"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
            >
              <Construction size={17} />
              Report Road Damage
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* TRACK MY COMPLAINT SEARCH BAR (NEW) */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Track My Complaint Live
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search by Complaint Reference Number, District, or Damage Type
                </p>
              </div>
            </div>

            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Enter Reference No. (e.g. SETTU-2026-BUX-1024)..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 pl-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              {searchRef && (
                <button
                  type="button"
                  onClick={() => setSearchRef("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Grievances",
              count: reports.length,
              icon: ClipboardList,
              color: "text-slate-700 bg-slate-100",
            },
            {
              title: "Registered",
              count: registeredCount,
              icon: Bell,
              color: "text-amber-700 bg-amber-50",
            },
            {
              title: "Under Repair & Audit",
              count: inProgressCount,
              icon: Clock3,
              color: "text-blue-700 bg-blue-50",
            },
            {
              title: "Verified Resolved",
              count: resolvedCount,
              icon: CheckCircle2,
              color: "text-emerald-700 bg-emerald-50",
            },
          ].map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-xl p-2.5 ${stat.color}`}>
                  <stat.icon size={20} />
                </span>
                <span className="text-2xl font-black tabular-nums text-slate-900">
                  {loading ? "—" : stat.count}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{stat.title}</p>
            </article>
          ))}
        </section>

        {/* Complaints List Section with Flipkart Style Stepper */}
        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Submitted Road Grievance Registry
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Live stage-by-stage progression tracking with official notes and timestamps.
              </p>
            </div>

            <button
              onClick={() => void loadReports()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Status
            </button>
          </div>

          {message && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-medium text-slate-500">
              <RefreshCw className="mx-auto mb-3 animate-spin text-orange-600" size={24} />
              Synchronizing grievance records from district database...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FileText size={28} />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {searchRef ? "No matching complaint found" : "No Complaints Recorded"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                {searchRef
                  ? `No grievance matches the query "${searchRef}". Check your reference number.`
                  : "You have not filed any road damage complaints yet. Capture damaged road photos to notify authorities."}
              </p>
              {!searchRef && (
                <Link
                  href="/report"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500"
                >
                  File Your First Complaint <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReports.map((report) => {
                const tracker = getTrackingStage(report.status);

                // Step status check
                const isStep1Done = tracker.stage >= 1;
                const isStep2Done = tracker.stage >= 2;
                const isStep3Done = tracker.stage >= 3;
                const isStep4Done = tracker.stage >= 4;

                return (
                  <article
                    key={report.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    {/* Header Strip */}
                    <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-black tracking-wider text-white font-mono">
                            {report.complaint_id}
                          </span>
                          {report.district && (
                            <span className="rounded bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
                              District: {report.district}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            Lodge Date:{" "}
                            {new Date(report.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${tracker.badgeColor}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${tracker.dotColor}`} />
                          {tracker.title}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-base font-black text-slate-900">
                        {report.damage_type}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {report.description || "No specific grievance remarks provided."}
                      </p>
                    </div>

                    {/* FLIPKART STYLE 4-STEP LIVE TRACKER */}
                    <div className="p-5 sm:p-6 border-b border-slate-100">
                      <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Live Redressal Progress (Flipkart Stepper)
                      </p>

                      <div className="relative grid grid-cols-4 gap-2">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                        <div
                          className="absolute top-4 left-6 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                          style={{
                            width:
                              tracker.stage === 1
                                ? "0%"
                                : tracker.stage === 2
                                ? "33%"
                                : tracker.stage === 3
                                ? "66%"
                                : "100%",
                          }}
                        />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                              isStep1Done
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            <Check size={14} />
                          </div>
                          <p className="mt-2 text-[11px] font-bold text-slate-800">
                            Grievance Logged
                          </p>
                          <p className="text-[10px] text-slate-400 hidden sm:block">
                            GPS Verified
                          </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                              isStep2Done
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isStep2Done ? <Check size={14} /> : "2"}
                          </div>
                          <p className="mt-2 text-[11px] font-bold text-slate-800">
                            Repair Division
                          </p>
                          <p className="text-[10px] text-slate-400 hidden sm:block">
                            {tracker.stage >= 2 ? "In Action" : "Queued"}
                          </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                              isStep3Done
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isStep3Done ? <Check size={14} /> : "3"}
                          </div>
                          <p className="mt-2 text-[11px] font-bold text-slate-800">
                            Quality Audit
                          </p>
                          <p className="text-[10px] text-slate-400 hidden sm:block">
                            Monitoring Dept
                          </p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                              isStep4Done
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isStep4Done ? <Check size={14} /> : "4"}
                          </div>
                          <p className="mt-2 text-[11px] font-bold text-slate-800">
                            Resolved
                          </p>
                          <p className="text-[10px] text-slate-400 hidden sm:block">
                            Audited & Closed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Case Details Action */}
                    <div className="p-4 sm:p-5 bg-white">
                      <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin size={14} className="text-orange-600 shrink-0" />
                          <span className="truncate">{report.address || "Location not provided"}</span>
                        </p>

                        <p className="flex items-center gap-1.5">
                          <Activity size={14} className="text-slate-400 shrink-0" />
                          <span>Urgency: <strong>{report.urgency || "Normal"}</strong></span>
                        </p>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                          >
                            <Eye size={14} /> View Complete Dossier & Photos
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Case Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                  Grievance Dossier
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {selectedReport.complaint_id} — {selectedReport.damage_type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-700">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-900">Description & Location</p>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {selectedReport.description || "No description provided."}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-slate-500 font-medium">
                  <span>District: <strong>{selectedReport.district || "N/A"}</strong></span>
                  <span>
                    GPS: <strong>{selectedReport.latitude?.toFixed(5)}, {selectedReport.longitude?.toFixed(5)}</strong>
                  </span>
                </div>
              </div>

              {/* Photos Comparison */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 font-bold text-slate-900">Reported Damaged Road Photo</p>
                  {selectedReport.photo_path ? (
                    <img
                      src={selectedReport.photo_path}
                      alt="Reported Road"
                      className="h-44 w-full rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      No photo attached
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 font-bold text-slate-900">Repaired Evidence (Official)</p>
                  {selectedReport.repaired_photo_path ? (
                    <img
                      src={selectedReport.repaired_photo_path}
                      alt="Repaired Road"
                      className="h-44 w-full rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-center p-3">
                      Repair photo will appear once submitted by department
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.monitoring_notes && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <p className="font-bold text-purple-900">Monitoring Committee Audit Report</p>
                  <p className="mt-1 text-purple-800 leading-relaxed">
                    {selectedReport.monitoring_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}