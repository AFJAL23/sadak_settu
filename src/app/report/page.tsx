'use client';

import { createClient } from '../lib/supabase/browser';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  MapPin,
  CheckCircle2,
  LoaderCircle,
  Upload,
  X,
  RotateCcw,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export default function ReportPage() {
  const supabase = createClient();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [damageType, setDamageType] = useState('Pothole');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [photo, setPhoto] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [district, setDistrict] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [error, setError] = useState('');
  const [complaintId, setComplaintId] = useState('');

  // Prefill user name if logged in
  useEffect(() => {
    async function loadUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
    }
    void loadUserProfile();
  }, [supabase]);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {
        setError('Camera preview could not start. Please verify browser permissions.');
      });
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function lookupDistrict(coords: LocationData) {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(coords.latitude));
    url.searchParams.set('lon', String(coords.longitude));
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error('District lookup failed.');
    }

    const result = await response.json();
    const geoAddress = result.address ?? {};

    const detectedDistrict = String(
      geoAddress.state_district ??
      geoAddress.district ??
      geoAddress.county ??
      geoAddress.city ??
      ''
    ).replace(/District/i, '').trim();

    return {
      district: detectedDistrict,
      displayAddress: String(result.display_name ?? ''),
    };
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('GPS sensor unavailable. Enter address and district manually.');
      return;
    }

    setLocating(true);
    setLocationMessage('Querying device GPS satellite coordinates...');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(coords);
        setLocationMessage('GPS locked. Performing district geofence resolution...');

        try {
          const result = await lookupDistrict(coords);
          if (result.district) {
            setDistrict(result.district);
          }
          if (!address.trim() && result.displayAddress) {
            setAddress(result.displayAddress);
          }
          setLocationMessage(
            `Location pinned. District assigned: ${result.district || 'Custom'}.`
          );
        } catch {
          setLocationMessage(
            'GPS coordinates captured. Reverse district query failed, please type your district.'
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocation(null);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationMessage('Location permission denied. Please enter address manually.');
        } else {
          setLocationMessage('Unable to retrieve GPS. Please type the location manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function openCamera() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access requires a secure origin (localhost or HTTPS).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      setCameraOpen(true);

      if (!location) {
        void detectLocation();
      }
    } catch (err) {
      const cameraError = err as DOMException;
      if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
        setError('Camera permission blocked in browser settings.');
      } else {
        setError('Camera not accessible. Please upload a captured photo directly.');
      }
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Camera initialising. Please wait for the video stream.');
      return;
    }

    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1400 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Photo processing failed.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.8));
    setError('');
    closeCamera();
  }

  async function handlePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Invalid file format. Please upload an image.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Photo exceeds maximum file limit of 12 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image decode error.'));
      });

      const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image canvas rendering failed.');

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/jpeg', 0.8));
      setError('');
    } catch {
      setError('Unable to parse photo. Please try another file.');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function submitReport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (submitting) return;

    if (!name.trim() || !description.trim()) {
      setError('Please provide your name and problem description.');
      return;
    }
    if (!photo) {
      setError('Damaged road photo is mandatory for audit verification.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter the landmark or street address.');
      return;
    }
    if (!district.trim()) {
      setError('District identification is required to assign local engineers.');
      return;
    }

    setSubmitting(true);

    const cleanDistrict = district.trim().toUpperCase().slice(0, 3);
    const generatedId = `SETTU-2026-${cleanDistrict || 'ROD'}-${Math.floor(1000 + Math.random() * 9000)}`;
    let uploadedStoragePath: string | null = null;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Active session expired. Please sign in again.');
      }

      // Convert base64 data to Blob
      const imageBlob = await fetch(photo).then((res) => res.blob());
      const fileName = `${generatedId}_${Date.now()}.jpg`;

      // Upload to Supabase Storage 'road-photos'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('road-photos')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Photo cloud storage failed: ${uploadError.message}`);
      }

      uploadedStoragePath = uploadData.path;

      // Extract Public URL
      const { data: urlData } = supabase.storage
        .from('road-photos')
        .getPublicUrl(uploadData.path);

      const photoUrl = urlData?.publicUrl || uploadData.path;

      // Insert record to database
      const { error: insertError } = await supabase
        .from('road_reports')
        .insert({
          user_id: user.id,
          complaint_id: generatedId,
          name: name.trim(),
          damage_type: damageType,
          description: description.trim(),
          urgency,
          address: address.trim(),
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          location_accuracy: location?.accuracy ?? null,
          district: district.trim(),
          photo_path: photoUrl,
          status: 'Submitted',
        });

      if (insertError) {
        throw new Error(`Database transaction error: ${insertError.message}`);
      }

      setComplaintId(generatedId);
    } catch (err: any) {
      if (uploadedStoragePath) {
        await supabase.storage.from('road-photos').remove([uploadedStoragePath]);
      }
      setError(err?.message || 'Unable to register complaint. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100';

  const labelClass = 'block text-xs font-bold text-slate-800';

  if (complaintId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 selection:bg-orange-500 selection:text-white">
        <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Official Grievance Registered
          </span>

          <h1 className="mt-3 text-2xl font-black text-slate-900">
            Grievance Reference Number
          </h1>

          <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
            <p className="text-2xl font-black tracking-wide text-orange-600 font-mono">
              {complaintId}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-slate-600">
              Assigned District Jurisdiction: <strong>{district}</strong>
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-600">
            Your road damage report has been forwarded to the <strong>{district} Road Repair Division</strong>.
            You can monitor inspection, repair proof, and statutory approval from your dashboard.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/dashboard/citizen"
              className="flex-1 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-500"
            >
              Open Citizen Dashboard
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12 selection:bg-orange-500 selection:text-white">
      <section className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/dashboard/citizen"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
          <span className="text-[11px] font-bold text-slate-400">
            FORM ST-CIVIC-01
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Header Banner */}
          <div className="bg-slate-950 px-6 py-6 text-white sm:px-8">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                <MapPin size={20} />
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Lodge Road Damage Grievance
                </h1>
                <p className="text-xs text-slate-300">
                  Geo-tagged live evidence submission for district repair teams
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submitReport} className="space-y-5 p-6 sm:p-8">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className={labelClass}>
                Complainant Full Name *
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Enter your official name"
              />
            </div>

            {/* Photo Section */}
            <div>
              <div className="flex items-center justify-between">
                <p className={labelClass}>Damaged Road Photo Evidence *</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Geo-tagged
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Live camera capture recommended for verified GPS tagging.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-orange-500"
                >
                  <Camera size={16} /> Open Camera
                </button>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Upload size={16} /> Upload Device File
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handlePhoto(e.currentTarget.files?.[0]);
                  e.currentTarget.value = '';
                }}
              />

              {/* Camera Preview */}
              {cameraOpen && (
                <div className="mt-4 overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-3">
                  <div className="mb-2 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Camera size={14} /> Live Viewfinder Active
                    </span>
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="rounded p-1 hover:bg-slate-800"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-72 w-full rounded-xl bg-black object-contain"
                  />

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Camera size={16} /> Click Photo & Pin Coordinates
                  </button>
                </div>
              )}

              {/* Selected Photo Display */}
              {photo && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Captured Frame</span>
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      <RotateCcw size={13} /> Retake
                    </button>
                  </div>
                  <img
                    src={photo}
                    alt="Road issue preview"
                    className="max-h-64 w-full rounded-xl object-contain border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* GPS & Location Module */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-800">
                    <MapPin size={15} className="text-orange-600" /> Auto Geo-Tagging
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Pins exact latitude & longitude coordinates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void detectLocation()}
                  disabled={locating || submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  {locating ? (
                    <LoaderCircle size={14} className="animate-spin text-orange-600" />
                  ) : (
                    <MapPin size={14} />
                  )}
                  {locating ? 'Acquiring...' : 'Refresh GPS'}
                </button>
              </div>

              {locationMessage && (
                <p className="mt-2 rounded-lg bg-white p-2.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  {locationMessage}
                </p>
              )}

              {location && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white p-3 text-xs text-slate-700 border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block">LATITUDE</span>
                    <span className="font-mono font-bold">{location.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">LONGITUDE</span>
                    <span className="font-mono font-bold">{location.longitude.toFixed(6)}</span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="address" className={labelClass}>
                  Road Address / Landmark *
                </label>
                <input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Near Station Road, Main Market, Dumraon"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="district" className={labelClass}>
                  District Jurisdiction *
                </label>
                <input
                  id="district"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Buxar, Bhojpur, Patna, etc."
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  * Auto-detected by GPS. You can edit or verify your district name here.
                </p>
              </div>
            </div>

            {/* Damage Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="damageType" className={labelClass}>
                  Damage Classification
                </label>
                <select
                  id="damageType"
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  className={fieldClass}
                >
                  <option>Pothole</option>
                  <option>Broken Road & Gravel</option>
                  <option>Waterlogging / Drainage Leak</option>
                  <option>Structural Crack / Depression</option>
                  <option>Damaged Manhole Cover</option>
                  <option>Other Road Hazard</option>
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className={labelClass}>
                  Severity / Urgency Level
                </label>
                <select
                  id="urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className={fieldClass}
                >
                  <option>Low (Surface Blemish)</option>
                  <option>Medium (Disrupts Traffic)</option>
                  <option>High (Fatal Accident Hazard)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Damage Remarks & Context *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={fieldClass}
                placeholder="Mention road dimension, depth, accident risk, or duration of damage..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || locating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <LoaderCircle size={16} className="animate-spin" />}
              {submitting ? 'Registering Grievance...' : 'Submit Grievance to District Division'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}