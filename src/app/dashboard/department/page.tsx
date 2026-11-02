"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/browser";
import {
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Wrench,
  X,
  IndianRupee,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Building2,
  Clock3,
  FileText,
  Menu,
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
  repaired_photo_path?: string | null;
  repair_cost?: number | null;
  repair_notes?: string | null;
  monitoring_notes?: string | null;
  status: string;
  created_at: string;
};

export default function DepartmentDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<RoadReport | null>(null);

  // Form states
  const [workDone, setWorkDone] = useState("");
  const [materials, setMaterials] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);

  // Department user details
  const [deptDistrict, setDeptDistrict] = useState<string | null>(null);
  const [deptEmail, setDeptEmail] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        router.replace("/login?mode=official");
        return;
      }

      setDeptEmail(auth.user.email ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, district")
        .eq("id", auth.user.id)
        .single();

      const userRole = String(profile?.role || "").toLowerCase();

      if (profileError || !["department", "repair_department"].includes(userRole)) {
        setMessage("Access Denied: Authorized Road Repair Division credentials required.");
        setReports([]);
        return;
      }

      const assignedDistrict = profile.district ? profile.district.trim() : null;
      setDeptDistrict(assignedDistrict);

      let query = supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, district, latitude, longitude, photo_path, repaired_photo_path, repair_cost, repair_notes, monitoring_notes, status, created_at"
        )
        .order("created_at", { ascending: false });

      // Case-insensitive district match
      if (assignedDistrict) {
        query = query.ilike("district", assignedDistrict);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReports((data ?? []) as RoadReport[]);
    } catch (error) {
      setReports([]);
      setMessage(
        error instanceof Error ? error.message : "Unable to retrieve district grievance list."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login?mode=official");
  }

  async function submitRepairReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected || !workDone.trim() || !completionPhoto || !repairCost.trim()) {
      setMessage("Please fill all mandatory fields: Work details, repair cost, and after-repair photo.");
      return;
    }

    if (isNaN(Number(repairCost)) || Number(repairCost) <= 0) {
      setMessage("Please enter a valid numeric repair cost in INR (₹).");
      return;
    }

    setSaving(true);
    setMessage("");

    let uploadedPath = "";

    try {
      const safeName = completionPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${selected.complaint_id}_${Date.now()}_${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("repair-photos")
        .upload(path, completionPhoto, {
          contentType: completionPhoto.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("repair-photos")
        .getPublicUrl(uploadData.path);

      uploadedPath = publicUrlData.publicUrl;

      const structuredNote = [
        `Action Executed: ${workDone.trim()}`,
        `Material Specifications: ${materials.trim() || "Standard bitumen/aggregate mix"}`,
      ].join("\n");

      const { error: updateError } = await supabase
        .from("road_reports")
        .update({
          repaired_photo_path: uploadedPath,
          repair_cost: Number(repairCost),
          repair_notes: structuredNote,
          repair_completed_at: new Date().toISOString(),
          status: "Under Quality Audit",
        })
        .eq("id", selected.id);

      if (updateError) throw updateError;

      setReports((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? {
                ...r,
                repaired_photo_path: uploadedPath,
                repair_cost: Number(repairCost),
                repair_notes: structuredNote,
                status: "Under Quality Audit",
              }
            : r
        )
      );

      setMessage(`Complaint ${selected.complaint_id} updated and forwarded to Monitoring Committee.`);
      setSelected(null);
      setWorkDone("");
      setMaterials("");
      setRepairCost("");
      setCompletionPhoto(null);
    } catch (err: any) {
      setMessage(err?.message || "Failed to submit repair completion dossier.");
    } finally {
      setSaving(false);
    }
  }

  const pendingCount = reports.filter((r) =>
    ["Submitted", "Grievance Registered", "Rework Ordered"].includes(r.status)
  ).length;
  const underAuditCount = reports.filter((r) =>
    ["Under Quality Audit", "Repair Completed"].includes(r.status)
  ).length;
  const closedCount = reports.filter((r) =>
    ["Resolved", "Resolved & Approved"].includes(r.status)
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar matching Citizen Dashboard */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20">
              <Building2 size={22} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">
                सड़क<span className="text-orange-600">-SETTU</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                Road Repair Division (Operations)
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400">Jurisdiction Division</p>
              <p className="text-xs font-bold uppercase text-slate-800">
                {deptDistrict || "All Districts"}
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
        </div>
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
                DISTRICT OPERATIONS DESK
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Road Repair Division Console
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Examine geotagged damaged road complaints from citizens in {deptDistrict || "your district"},
                execute on-ground repair work, and submit repair dossiers with cost breakdown for quality verification.
              </p>
            </div>

            <button
              onClick={() => void loadReports()}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Worklist
            </button>
          </div>
        </section>

        {/* Stats Grid matching Citizen styling */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-amber-700 bg-amber-50">
                <ClipboardList size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : pendingCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Pending Action / Rework</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-purple-700 bg-purple-50">
                <Clock3 size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : underAuditCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Submitted for Quality Audit</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl p-2.5 text-emerald-700 bg-emerald-50">
                <CheckCircle2 size={20} />
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {loading ? "—" : closedCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Approved & Resolved</p>
          </article>
        </section>

        {message && (
          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs font-medium text-orange-900">
            {message}
          </div>
        )}

        {/* Complaints Worklist */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Assigned District Road Complaints
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Field reports logged by citizens inside {deptDistrict || "your district jurisdiction"}.
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {reports.length} Cases
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-medium text-slate-500">
              <RefreshCw className="mx-auto mb-3 animate-spin text-orange-600" size={24} />
              Synchronizing district worklist...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FileText size={28} />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                No Complaints in Queue
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                There are no open road damage complaints logged for district &ldquo;{deptDistrict}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md lg:grid-cols-[200px_1fr]"
                >
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {report.photo_path ? (
                      <img
                        src={report.photo_path}
                        alt="Damaged Road"
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-xs text-slate-400">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-white">
                            {report.complaint_id}
                          </span>
                          <span className="rounded bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
                            District: {report.district || "N/A"}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                            report.status.includes("Resolv")
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : report.status.includes("Rework")
                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              : report.status.includes("Audit")
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-black text-slate-900">
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
                            Open Google Maps GPS
                          </a>
                        )}
                      </div>

                      {/* Rework Note Alert if sent back */}
                      {report.monitoring_notes && (
                        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                          <strong>Inspector Audit Remark:</strong> {report.monitoring_notes}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] text-slate-400">
                        Lodged: {new Date(report.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      {["Submitted", "Grievance Registered", "Rework Ordered"].includes(report.status) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(report);
                            setMessage("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500"
                        >
                          <Wrench size={14} /> Submit Repair Evidence
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          {report.status.includes("Resolv")
                            ? "✓ Verified & Closed"
                            : "⏳ Forwarded to Monitoring Board"}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Repair Report Submission Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                  Work Completion Report
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {selected.complaint_id} — {selected.damage_type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitRepairReport} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800">
                  Work Carried Out *
                </label>
                <textarea
                  required
                  rows={3}
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  placeholder="Describe repair execution (pothole filling, bitumen patch, road leveled)..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800">
                  Material Details & Specifications
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. Cold mix asphalt 50kg, stone aggregate"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800">
                  Total Repair Cost (₹ INR) *
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    placeholder="e.g. 18500"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 pl-8 font-mono text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800">
                  After-Repair Proof Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  onChange={(e) => setCompletionPhoto(e.target.files?.[0] ?? null)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-orange-500"
                />
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-[11px] text-orange-900">
                Notice: Submitting will forward this dossier to the Monitoring Committee for quality inspection and formal sign-off.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {saving ? "Forwarding..." : "Submit to Monitoring Dept"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}