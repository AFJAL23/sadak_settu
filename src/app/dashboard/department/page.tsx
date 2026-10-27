
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/browser";
import { ClipboardList, RefreshCw, ShieldCheck, MapPin, Wrench, X } from "lucide-react";

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
  status: string;
  created_at: string;
  photo_url?: string | null;
};

export default function DepartmentDashboard() {
  const supabase = createClient();

  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<RoadReport | null>(null);
  const [workDone, setWorkDone] = useState("");
  const [materials, setMaterials] = useState("");
  const [remainingIssues, setRemainingIssues] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);
  const [districtFilter, setDistrictFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        setMessage("Please log in to view department reports.");
        setReports([]);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (profileError || profile?.role !== "repair_department") {
        setMessage("Access denied. Repair Department account required.");
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from("road_reports")
        .select(
          "id, complaint_id, damage_type, description, urgency, address, district, latitude, longitude, photo_path, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as RoadReport[];

      const result = await Promise.all(
        rows.map(async (report) => {
          if (!report.photo_path) {
            return { ...report, photo_url: null };
          }

          const { data: signed, error: photoError } =
            await supabase.storage
              .from("road-photos")
              .createSignedUrl(report.photo_path, 3600);

          return {
            ...report,
            photo_url: photoError ? null : signed?.signedUrl ?? null,
          };
        })
      );

      setReports(result);
    } catch (error) {
      setReports([]);
      setMessage(
        error instanceof Error ? error.message : "Could not load reports."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function submitRepairReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected || !workDone.trim() || !completionPhoto) {
      setMessage("Work details and an after-repair photo are required.");
      return;
    }

    if (!completionPhoto.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (completionPhoto.size > 5 * 1024 * 1024) {
      setMessage("Photo must be 5 MB or smaller.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Please log in again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (profileError || profile?.role !== "repair_department") {
        throw new Error("Repair Department account required.");
      }

      const safeName = completionPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${selected.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("repair-photos")
        .upload(path, completionPhoto, {
          contentType: completionPhoto.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const repairNote = [
        `Work performed: ${workDone.trim()}`,
        `Materials used: ${materials.trim() || "Not specified"}`,
        `Remaining issues: ${remainingIssues.trim() || "None reported"}`,
      ].join("\n");

      const { data: updated, error: updateError } = await supabase
        .from("road_reports")
        .update({
          repair_photo_path: path,
          repair_note: repairNote,
          repair_completed_at: new Date().toISOString(),
          status: "Repair Completed",
        })
        .eq("id", selected.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updated) {
        throw new Error(
          "Repair report was not saved. Check the road_reports UPDATE policy."
        );
      }

      setReports((previous) =>
        previous.map((report) =>
          report.id === selected.id
            ? { ...report, status: "Repair Completed" }
            : report
        )
      );

      setMessage(
        `Repair report submitted for ${selected.complaint_id}. It is ready for monitoring review.`
      );

      setSelected(null);
      setWorkDone("");
      setMaterials("");
      setRemainingIssues("");
      setCompletionPhoto(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not submit repair report."
      );
    } finally {
      setSaving(false);
    }
  }

  const districts = [
    ...new Set(
      reports.map((r) => r.district).filter(Boolean) as string[]
    ),
  ].sort();

  const filtered = reports.filter(
    (r) =>
      (districtFilter === "All" || r.district === districtFilter) &&
      (statusFilter === "All" || r.status === statusFilter)
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-400">
              SADAK-SETTU • REPAIR OPERATIONS
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Department Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Review complaints and submit repair completion evidence.
            </p>
          </div>

          <button
            onClick={() => void loadReports()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            <RefreshCw size={18} /> Refresh Reports
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Total Reports" value={reports.length} />
          <Stat
            label="In Progress"
            value={reports.filter((r) => r.status === "In Progress").length}
          />
          <Stat
            label="Repair Completed"
            value={reports.filter((r) => r.status === "Repair Completed").length}
          />
        </div>

        {message && (
          <div role="status" className="mb-5 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm">
            {message}
          </div>
        )}

        <section className="mb-6 flex flex-wrap gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <label className="text-sm text-slate-300">
            District
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="mt-2 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="All">All districts</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Repair Completed">Repair Completed</option>
            </select>
          </label>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-bold">Road Damage Complaints</h2>

          {loading ? (
            <p className="text-slate-400">Loading reports...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-slate-400">No matching reports found.</p>
          ) : (
            <div className="space-y-5">
              {filtered.map((report) => (
                <article
                  key={report.id}
                  className="grid gap-5 rounded-xl border border-slate-700 p-4 lg:grid-cols-[220px_1fr]"
                >
                  <div className="overflow-hidden rounded-lg bg-slate-950">
                    {report.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={report.photo_url}
                        alt="Original road damage"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-slate-500">
                        Original photo unavailable
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-semibold text-emerald-400">
                          {report.complaint_id}
                        </p>
                        <h3 className="mt-1 text-xl font-bold">{report.damage_type}</h3>
                      </div>
                      <span className="h-fit rounded-full bg-slate-800 px-3 py-1 text-sm">
                        {report.status}
                      </span>
                    </div>

                    <p className="mt-3 text-slate-300">
                      {report.description || "No description provided."}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      <MapPin size={15} className="mr-1 inline" />
                      {report.address || "Address unavailable"} · {report.district || "District unknown"}
                    </p>

                    {report.latitude != null && report.longitude != null && (
                      <a
                        className="mt-1 inline-block text-sm text-emerald-400 underline"
                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open GPS location
                      </a>
                    )}

                    <div className="mt-4">
                      {report.status === "Repair Completed" ? (
                        <p className="text-sm text-emerald-400">
                          Repair report submitted · Awaiting monitoring review
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            setSelected(report);
                            setMessage("");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          <Wrench size={17} /> Take Action
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4">
          <section className="my-6 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-400">
                  {selected.complaint_id}
                </p>
                <h2 className="mt-1 text-2xl font-bold">Repair Completion Report</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {selected.damage_type} · {selected.address || "Location unavailable"}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setSelected(null)}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-800"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submitRepairReport} className="space-y-5">
              <label className="block text-sm font-medium text-slate-200">
                Work performed <span className="text-red-400">*</span>
                <textarea
                  required
                  minLength={10}
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  placeholder="Describe what repair was carried out and what improved..."
                  className="mt-2 min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                Materials and work details
                <textarea
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. patching material, resurfacing, estimated quantity..."
                  className="mt-2 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                Remaining issues / remarks
                <textarea
                  value={remainingIssues}
                  onChange={(e) => setRemainingIssues(e.target.value)}
                  placeholder="Mention pending work, or leave blank if none."
                  className="mt-2 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                After-repair photo <span className="text-red-400">*</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  onChange={(e) => setCompletionPhoto(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:font-semibold file:text-slate-950"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Image only, maximum 5 MB.
                </span>
              </label>

              <div className="rounded-lg border border-amber-800/70 bg-amber-950/30 p-3 text-sm text-amber-200">
                Submitting marks the repair as completed and makes the report ready for monitoring review. It does not mean monitoring has approved it.
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-700 px-4 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Repair Report"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <ShieldCheck className="mb-3 text-emerald-400" size={26} />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
