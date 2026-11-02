"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/browser";
import {
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Image as ImageIcon,
  LogOut,
  IndianRupee,
  Building2,
  FileText,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

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
  repaired_photo_path: string | null;
  repair_cost: number | null;
  repair_notes: string | null;
  repair_completed_at: string | null;
  monitoring_notes: string | null;
  monitoring_approved_at: string | null;
  status: string;
  created_at: string;
};

const isPendingInspection = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  return (
    s.includes("audit") ||
    s.includes("repair completed") ||
    s.includes("pending monitoring") ||
    s.includes("under quality audit")
  );
};

export default function MonitoringDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [officerDistrict, setOfficerDistrict] = useState<string | null>(null);
  const [officerEmail, setOfficerEmail] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.replace("/login?mode=official");
        return;
      }

      setOfficerEmail(auth.user.email ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, district")
        .eq("id", auth.user.id)
        .single();

      if (profileError) throw profileError;

      const userRole = String(profile?.role || "").toLowerCase();
      if (!["monitoring", "monitoring_committee"].includes(userRole)) {
        setReports([]);
        setMessage("Access Denied: Statutory Quality Monitoring Committee credentials required.");
        return;
      }

      const assignedDistrict = profile.district ? profile.district.trim() : null;
      setOfficerDistrict(assignedDistrict);

      let query = supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, district, latitude, longitude, photo_path, repaired_photo_path, repair_cost, repair_notes, repair_completed_at, monitoring_notes, monitoring_approved_at, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (assignedDistrict) {
        query = query.ilike("district", assignedDistrict);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReports((data ?? []) as RoadReport[]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load quality audit queue."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const pendingReports = reports.filter((r) => isPendingInspection(r.status));
  const approvedCount = reports.filter((r) =>
    (r.status || "").toLowerCase().includes("approv") ||
    (r.status || "").toLowerCase().includes("resolv")
  ).length;
  const reworkCount = reports.filter((r) =>
    (r.status || "").toLowerCase().includes("rework")
  ).length;

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login?mode=official");
  }

  async function decide(report: RoadReport, decision: "approve" | "rework") {
    const note = (notes[report.id] ?? "").trim();

    if (!note) {
      setMessage("Mandatory: Please record inspector remarks before submitting your decision.");
      return;
    }

    if (decision === "approve" && !report.repaired_photo_path) {
      setMessage("Verification Failure: After-repair photo proof is mandatory for formal sign-off.");
      return;
    }

    const confirmed = window.confirm(
      decision === "approve"
        ? `Confirm Approval & Statutory Closure for Complaint #${report.complaint_id}?`
        : `Return Complaint #${report.complaint_id} to Road Repair Division for Rework?`
    );

    if (!confirmed) return;

    setSavingId(report.id);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Session expired. Please log in.");

      const isApproved = decision === "approve";
      const targetStatus = isApproved ? "Resolved & Approved" : "Rework Ordered";

      const { data: updatedRows, error } = await supabase
        .from("road_reports")
        .update({
          status: targetStatus,
          monitoring_officer_id: auth.user.id,
          monitoring_approved_at: isApproved ? new Date().toISOString() : null,
          monitoring_notes: note,
        })
        .eq("id", report.id)
        .select("id");

      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error("Update rejected by database. Check RLS security policies.");
      }

      setNotes((prev) => {
        const next = { ...prev };
        delete next[report.id];
        return next;
      });

      setMessage(
        isApproved
          ? `✓ Complaint #${report.complaint_id} approved. Marked as Resolved on citizen portal.`
          : `⚠ Rework command issued for #${report.complaint_id}. Reverted to Repair Division.`
      );

      await loadReports();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save audit verdict.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-white shadow-md shadow-purple-600/20">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">
                सड़क<span className="text-orange-600">-SETTU</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                Statutory Quality & Monitoring Board
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400">Audit Jurisdiction</p>
              <p className="text-xs font-bold uppercase text-slate-800">
                {officerDistrict || "All Districts"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-60"
            >
              <LogOut size={14} />
              {loggingOut ? "Exiting..." : "Sign Out"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                QUALITY AUDIT & COMPLIANCE DESK
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Independent Quality Verification Console
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Audit completed repair jobs in <strong>{officerDistrict || "Assigned District"}</strong>.
                Compare on-ground photos before & after repair, audit reported expenditure, and approve resolution or order rework.
              </p>
            </div>

            <button
              onClick={() => void loadReports()}
              disabled={loading || !!savingId || loggingOut}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Audit Queue
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-slate-700 bg-slate-100">
                <FileText size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : reports.length}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Total District Filings</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-purple-700 bg-purple-50">
                <Clock size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : pendingReports.length}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Pending Quality Inspection</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-emerald-700 bg-emerald-50">
                <CheckCircle2 size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : approvedCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Statutorily Approved</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-rose-700 bg-rose-50">
                <RotateCcw size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : reworkCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Rework Commands Issued</p>
          </article>
        </section>

        {message && (
          <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs font-medium text-purple-900">
            {message}
          </div>
        )}

        {/* Audit Queue */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Repairs Awaiting Quality Verification
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Dossiers submitted by Road Repair Division requiring statutory evaluation before ticket closure.
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {pendingReports.length} In Queue
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-medium text-slate-500">
              <RefreshCw className="mx-auto mb-3 animate-spin text-purple-600" size={24} />
              Loading inspection docket...
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <CheckCircle2 size={28} />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Audit Queue is Clear
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                No repair jobs are currently awaiting quality inspection in district &ldquo;{officerDistrict}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  {/* Card Header */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-white">
                        {report.complaint_id}
                      </span>
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800">
                        District: {report.district || "N/A"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Lodged: {new Date(report.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <span className="rounded-full bg-purple-50 px-3 py-0.5 text-[11px] font-bold text-purple-700 ring-1 ring-purple-200">
                      {report.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-black text-slate-900">
                    {report.damage_type}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {report.description || "No specific citizen remarks provided."}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-orange-600" />
                      {report.address || "Location unavailable"}
                    </span>
                    {report.latitude && report.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-orange-600 underline"
                      >
                        Verify GPS Coordinates
                      </a>
                    )}
                  </div>

                  {/* SIDE-BY-SIDE PHOTO AUDIT */}
                  <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-800">
                        1. Citizen Reported Damage
                      </p>
                      {report.photo_path ? (
                        <a href={report.photo_path} target="_blank" rel="noreferrer">
                          <img
                            src={report.photo_path}
                            alt="Before Repair"
                            className="h-52 w-full rounded-xl border border-slate-200 object-cover"
                          />
                        </a>
                      ) : (
                        <div className="flex h-52 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-500">
                          Photo unavailable
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-800">
                        2. Repaired Road Proof (Department)
                      </p>
                      {report.repaired_photo_path ? (
                        <a href={report.repaired_photo_path} target="_blank" rel="noreferrer">
                          <img
                            src={report.repaired_photo_path}
                            alt="After Repair"
                            className="h-52 w-full rounded-xl border border-emerald-300 object-cover ring-2 ring-emerald-500/20"
                          />
                        </a>
                      ) : (
                        <div className="flex h-52 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-500">
                          Repair photo missing
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Department Notes & Cost Breakdown */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Department Work Notes
                      </p>
                      <p className="mt-1 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {report.repair_notes || "No additional execution details submitted."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Reported Costing
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-900 font-mono">
                        ₹{report.repair_cost ? report.repair_cost.toLocaleString("en-IN") : "0"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Statutory expenditure billed
                      </p>
                    </div>
                  </div>

                  {/* Inspector Remarks & Decision Bar */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <label
                      htmlFor={`note-${report.id}`}
                      className="block text-xs font-bold text-slate-800"
                    >
                      Statutory Audit Remarks & Findings *
                    </label>
                    <textarea
                      id={`note-${report.id}`}
                      rows={2}
                      value={notes[report.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                      }
                      placeholder="Enter quality audit feedback (e.g., Road surface leveled as per IRC specifications, quality approved / or Rework needed on edges)..."
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => void decide(report, "rework")}
                        disabled={savingId === report.id || loggingOut}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        {savingId === report.id ? "Processing..." : "Reject & Order Rework"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void decide(report, "approve")}
                        disabled={savingId === report.id || loggingOut}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        {savingId === report.id ? "Signing Off..." : "Approve & Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}