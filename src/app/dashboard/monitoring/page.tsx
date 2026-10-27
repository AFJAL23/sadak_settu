"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  repair_photo_path: string | null;
  repair_note: string | null;
  repair_completed_at: string | null;
  monitoring_note: string | null;
  monitoring_approved_at: string | null;
  status: string;
  created_at: string;
  originalPhotoUrl?: string | null;
  repairPhotoUrl?: string | null;
};

const normalizeStatus = (status: string) =>
  status.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const isPending = (status: string) =>
  ["repair completed", "pending monitoring", "pending approval"].includes(
    normalizeStatus(status)
  );

export default function MonitoringDashboard() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        setReports([]);
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== "monitoring_committee") {
        setReports([]);
        setMessage("Access denied. Monitoring Committee account required.");
        return;
      }

      const { data, error } = await supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, district, latitude, longitude, photo_path, repair_photo_path, repair_note, repair_completed_at, monitoring_note, monitoring_approved_at, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as RoadReport[];

      const withPhotos = await Promise.all(
        rows.map(async (report) => {
          let originalPhotoUrl: string | null = null;
          let repairPhotoUrl: string | null = null;

          if (report.photo_path) {
            const { data: photo } = await supabase.storage
              .from("road-photos")
              .createSignedUrl(report.photo_path, 3600);

            originalPhotoUrl = photo?.signedUrl ?? null;
          }

          if (report.repair_photo_path) {
            const { data: photo } = await supabase.storage
              .from("road-photos")
              .createSignedUrl(report.repair_photo_path, 3600);

            repairPhotoUrl = photo?.signedUrl ?? null;
          }

          return { ...report, originalPhotoUrl, repairPhotoUrl };
        })
      );

      setReports(withPhotos);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const pendingReports = reports.filter((r) => isPending(r.status));

  const approvedCount = reports.filter((r) =>
    ["verified", "approved", "monitoring approved"].includes(
      normalizeStatus(r.status)
    )
  ).length;

  const reworkCount = reports.filter((r) =>
    ["rework required", "rework requested"].includes(normalizeStatus(r.status))
  ).length;

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      setMessage(`Logout failed: ${error.message}`);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  async function decide(report: RoadReport, decision: "approve" | "rework") {
    const note = (notes[report.id] ?? "").trim();

    if (!note) {
      setMessage("Please enter inspection remarks before submitting.");
      return;
    }

    if (decision === "approve" && !report.repair_photo_path) {
      setMessage("A repair photo is required before approval.");
      return;
    }

    const confirmed = window.confirm(
      decision === "approve"
        ? `Approve repair for ${report.complaint_id}?`
        : `Request rework for ${report.complaint_id}?`
    );

    if (!confirmed) return;

    setSavingId(report.id);
    setMessage("");

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Session expired. Please log in again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== "monitoring_committee") {
        throw new Error("Monitoring Committee access is required.");
      }

      if (!isPending(report.status)) {
        throw new Error("This complaint is no longer pending inspection.");
      }

      const approved = decision === "approve";

      const { data: updatedRows, error } = await supabase
        .from("road_reports")
        .update({
          status: approved ? "Verified" : "Rework Required",
          monitoring_officer_id: auth.user.id,
          monitoring_approved_at: approved ? new Date().toISOString() : null,
          monitoring_note: note,
        })
        .eq("id", report.id)
        .eq("status", report.status)
        .select("id");

      if (error) throw error;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "No row updated. Check the road_reports UPDATE RLS policy."
        );
      }

      setNotes((previous) => {
        const next = { ...previous };
        delete next[report.id];
        return next;
      });

      setMessage(
        approved
          ? `${report.complaint_id} approved successfully.`
          : `Rework requested for ${report.complaint_id}.`
      );

      await loadReports();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save decision."
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-sky-400">
              SADAK-SETTU • INDEPENDENT INSPECTION
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Monitoring Officer Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Independently inspect completed repairs and record decisions.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => void loadReports()}
              disabled={loading || !!savingId || loggingOut}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              <RefreshCw size={18} /> Refresh
            </button>

            <button
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-3 hover:bg-slate-800 disabled:opacity-50"
            >
              <LogOut size={18} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Reports", value: reports.length, icon: <ShieldCheck size={26} /> },
            { label: "Pending Inspection", value: pendingReports.length, icon: <AlertTriangle size={26} /> },
            { label: "Approved", value: approvedCount, icon: <CheckCircle2 size={26} /> },
            { label: "Rework Required", value: reworkCount, icon: <Clock size={26} /> },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 text-sky-400">{item.icon}</div>
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-1 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {message && (
          <div role="status" className="mb-5 rounded-lg border border-sky-800 bg-sky-950/40 p-4 text-sky-200">
            {message}
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-xl font-bold">Repairs Awaiting Inspection</h2>

          {loading ? (
            <p className="text-slate-400">Loading complaints...</p>
          ) : pendingReports.length === 0 ? (
            <p className="text-slate-400">
              No repairs are awaiting inspection. Click Refresh to check again.
            </p>
          ) : (
            <div className="space-y-6">
              {pendingReports.map((report) => (
                <article key={report.id} className="rounded-xl border border-slate-700 p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sky-400">{report.complaint_id}</p>
                      <h3 className="mt-1 text-xl font-bold">{report.damage_type}</h3>
                    </div>
                    <span className="rounded-full bg-amber-950 px-3 py-1 text-sm text-amber-300">
                      {report.status}
                    </span>
                  </div>

                  <p className="mt-3 text-slate-300">
                    {report.description || "No description provided."}
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p><MapPin className="mr-1 inline" size={15} />{report.address || "Address unavailable"}</p>
                    <p>District: {report.district || "Not specified"}</p>
                    <p>Urgency: {report.urgency}</p>
                    {report.latitude != null && report.longitude != null && (
                      <p>GPS: {report.latitude}, {report.longitude}</p>
                    )}
                    <p>
                      Repair submitted:{" "}
                      {report.repair_completed_at
                        ? new Date(report.repair_completed_at).toLocaleString()
                        : "Time not recorded"}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-semibold"><ImageIcon className="mr-2 inline" size={18} />Original Damage Photo</h4>
                      {report.originalPhotoUrl ? (
                        <a href={report.originalPhotoUrl} target="_blank" rel="noreferrer">
                          <img src={report.originalPhotoUrl} alt="Original road damage" className="h-64 w-full rounded-lg border border-slate-700 object-cover" />
                        </a>
                      ) : (
                        <p className="rounded-lg bg-slate-800 p-4 text-sm text-slate-400">Original photo unavailable.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold"><ImageIcon className="mr-2 inline" size={18} />After-Repair Photo</h4>
                      {report.repairPhotoUrl ? (
                        <a href={report.repairPhotoUrl} target="_blank" rel="noreferrer">
                          <img src={report.repairPhotoUrl} alt="Completed road repair" className="h-64 w-full rounded-lg border border-slate-700 object-cover" />
                        </a>
                      ) : (
                        <p className="rounded-lg border border-amber-800 bg-amber-950/30 p-4 text-sm text-amber-200">Repair photo unavailable.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg bg-slate-800/70 p-4">
                    <h4 className="font-semibold">Repair Department Notes</h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                      {report.repair_note || "No repair notes provided."}
                    </p>
                  </div>

                  <div className="mt-5">
                    <label htmlFor={`note-${report.id}`} className="mb-2 block font-semibold">
                      Inspection Remarks (required)
                    </label>
                    <textarea
                      id={`note-${report.id}`}
                      value={notes[report.id] ?? ""}
                      onChange={(event) =>
                        setNotes((previous) => ({ ...previous, [report.id]: event.target.value }))
                      }
                      placeholder="Explain your inspection and decision..."
                      rows={3}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => void decide(report, "approve")}
                      disabled={!!savingId || loggingOut}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      {savingId === report.id ? "Saving..." : "Approve Repair"}
                    </button>

                    <button
                      onClick={() => void decide(report, "rework")}
                      disabled={!!savingId || loggingOut}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-3 font-semibold disabled:opacity-50"
                    >
                      <AlertTriangle size={18} />
                      {savingId === report.id ? "Saving..." : "Request Rework"}
                    </button>
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