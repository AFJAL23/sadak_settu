
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

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      void videoRef.current.play().catch(() => {
        setError('Camera preview could not start. Please try again.');
      });
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function lookupDistrict(coords: LocationData) {
    const url = new URL(
      'https://nominatim.openstreetmap.org/reverse'
    );

    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(coords.latitude));
    url.searchParams.set('lon', String(coords.longitude));
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('District lookup failed.');
    }

    const result = await response.json();
    const geoAddress = result.address ?? {};

    const detectedDistrict = String(
      geoAddress.state_district ??
      geoAddress.district ??
      geoAddress.county ??
      ''
    ).trim();

    if (!detectedDistrict) {
      throw new Error('District could not be identified.');
    }

    return {
      district: detectedDistrict,
      displayAddress: String(result.display_name ?? ''),
    };
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        'GPS unavailable. Enter the address and select the district manually.'
      );
      return;
    }

    setLocating(true);
    setLocationMessage('Requesting GPS permission...');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(coords);
        setDistrict('');
        setLocationMessage('GPS detected. Identifying district...');

        try {
          const result = await lookupDistrict(coords);

          setDistrict(result.district);

          if (!address.trim() && result.displayAddress) {
            setAddress(result.displayAddress);
          }

          setLocationMessage(
            `District identified: ${result.district}. Please verify the location before submitting.`
          );
        } catch {
          setLocationMessage(
            'GPS detected, but district lookup failed. Retry GPS or select the district manually.'
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocation(null);

        if (err.code === err.PERMISSION_DENIED) {
          setLocationMessage(
            'GPS permission denied. Enter the address and select the district manually.'
          );
        } else if (err.code === err.TIMEOUT) {
          setLocationMessage(
            'GPS timed out. Please try again or enter the address manually.'
          );
        } else {
          setLocationMessage(
            'Unable to detect GPS. Enter the address and select the district manually.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  async function openCamera() {
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera access is unavailable. Open this page on localhost or HTTPS.'
      );
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

      if (
        cameraError.name === 'NotAllowedError' ||
        cameraError.name === 'PermissionDeniedError'
      ) {
        setError(
          'Camera permission denied. Allow camera access in browser settings.'
        );
      } else if (cameraError.name === 'NotFoundError') {
        setError('No camera found. Please upload a photo instead.');
      } else if (cameraError.name === 'NotReadableError') {
        setError('Camera is being used by another app. Close it and retry.');
      } else {
        setError('Could not open the camera. Check device permissions.');
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
      setError('Wait until the camera preview appears.');
      return;
    }

    const canvas = document.createElement('canvas');
    const scale = Math.min(
      1,
      1400 / Math.max(video.videoWidth, video.videoHeight)
    );

    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to capture the photo.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.75));
    setError('');
    closeCamera();
  }

  async function handlePhoto(file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setError('Choose an image smaller than 12 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Could not read image.'));
      });

      const scale = Math.min(
        1,
        1400 / Math.max(image.width, image.height)
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not process image.');
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/jpeg', 0.75));
      setError('');
    } catch {
      setError('Unable to read this image. Please select another photo.');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function submitReport(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError('');

    if (submitting) return;

    if (!name.trim() || !description.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!photo) {
      setError('Capture a photo or choose one from your gallery.');
      return;
    }

    if (!address.trim()) {
      setError('Please enter the road address or landmark.');
      return;
    }

    if (!district.trim()) {
      setError(
        'District is not identified. Detect GPS again or select the district manually.'
      );
      return;
    }

    setSubmitting(true);

    const id = `SS-${Date.now().toString().slice(-8)}`;
    let uploadedPath: string | null = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Please log in before submitting a road report.');
      }

      const imageBlob = await fetch(photo).then((res) => res.blob());
      const filePath = `${id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('road-photos')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      uploadedPath = filePath;

      const { error: insertError } = await supabase
        .from('road_reports')
        .insert({
          user_id: user.id,
          complaint_id: id,
          name: name.trim(),
          damage_type: damageType,
          description: description.trim(),
          urgency,
          address: address.trim(),
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          location_accuracy: location?.accuracy ?? null,
          district: district.trim(),
          photo_path: uploadedPath,
          status: 'Submitted',
        });

      if (insertError) {
        throw new Error(`Database save failed: ${insertError.message}`);
      }

      setComplaintId(id);
    } catch (err) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from('road-photos')
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error('Photo cleanup failed:', cleanupError.message);
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit the report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100';

  const labelClass = 'block text-sm font-bold text-slate-800';

  if (complaintId) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-12">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />

          <h1 className="text-2xl font-extrabold text-slate-900">
            Report Submitted Successfully
          </h1>

          <p className="mt-3 text-slate-700">
            Your complaint reference number:
          </p>

          <p className="mt-2 text-3xl font-extrabold text-blue-700">
            {complaintId}
          </p>

          <p className="mt-4 text-sm text-slate-600">
            District: {district}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your report was saved to the database. Keep your reference number
            to track its status.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-700"
          >
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12">
      <section className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-700"
        >
          <ArrowLeft size={19} /> Back to Home
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="bg-slate-900 px-6 py-7 text-white sm:px-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <MapPin size={25} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Report Road Damage
            </h1>

            <p className="mt-2 leading-6 text-slate-200">
              Capture a photo and record the road location.
            </p>
          </div>

          <form onSubmit={submitReport} className="space-y-6 p-6 sm:p-8">
            <div>
              <label htmlFor="name" className={labelClass}>
                Your Name *
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <p className={labelClass}>Road Photo *</p>
              <p className="mt-1 text-sm text-slate-600">
                Open the live camera or select a photo from your device.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bold text-white shadow-sm hover:bg-blue-800"
                >
                  <Camera size={21} /> Open Camera
                </button>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 hover:border-blue-600 hover:bg-blue-50"
                >
                  <Upload size={21} /> Upload Photo
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

              {cameraOpen && (
                <div className="mt-4 overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2 text-white">
                    <span className="flex items-center gap-2 font-bold">
                      <Camera size={18} /> Live Camera
                    </span>

                    <button
                      type="button"
                      onClick={closeCamera}
                      className="rounded-lg p-2 hover:bg-slate-800"
                      aria-label="Close camera"
                    >
                      <X size={21} />
                    </button>
                  </div>

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-96 w-full rounded-xl bg-black object-contain"
                  />

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-extrabold text-white hover:bg-green-700"
                  >
                    <Camera size={21} /> Capture Photo
                  </button>
                </div>
              )}

              {photo && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-800">Selected Photo</p>

                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw size={16} /> Retake
                    </button>
                  </div>

                  <img
                    src={photo}
                    alt="Road damage selected for report"
                    className="max-h-72 w-full rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                    <MapPin size={21} /> Road Location
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Allow GPS access to record your coordinates and identify
                    the district.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void detectLocation()}
                  disabled={locating || submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-blue-700 bg-white px-4 py-2 font-bold text-blue-800 hover:bg-blue-50 disabled:opacity-60"
                >
                  {locating ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <MapPin size={18} />
                  )}
                  {locating ? 'Detecting...' : 'Detect Location'}
                </button>
              </div>

              <p
                aria-live="polite"
                className="mt-3 rounded-lg bg-white p-3 text-sm font-medium text-slate-700"
              >
                {locationMessage ||
                  'Your browser will ask permission to share your location.'}
              </p>

              {location && (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
                  <p>Latitude: {location.latitude.toFixed(6)}</p>
                  <p>Longitude: {location.longitude.toFixed(6)}</p>
                  <p>
                    GPS accuracy: approximately{' '}
                    {Math.round(location.accuracy)} metres
                  </p>

                  {district && (
                    <p className="mt-2 font-extrabold">
                      Detected district: {district}
                    </p>
                  )}

                  <a
                    className="mt-2 inline-block font-bold underline"
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}

              <label htmlFor="address" className={`${labelClass} mt-5`}>
                Road Address / Landmark *
              </label>

              <input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={fieldClass}
                placeholder="Street, Dumraon, Buxar or nearby landmark"
              />

              <label htmlFor="district" className={`${labelClass} mt-5`}>
                District *
              </label>

              <select
                id="district"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={fieldClass}
              >
                <option value="">Select or verify district</option>
                <option value="Buxar">Buxar</option>
                <option value="Bhojpur">Bhojpur</option>
                <option value="Rohtas">Rohtas</option>
                <option value="Kaimur">Kaimur</option>
                <option value="Patna">Patna</option>
                <option value="Other">Other / verify manually</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                GPS lookup provides a suggested district. Verify it before
                submission. If GPS lookup fails, select the correct district
                manually. This is not an official boundary verification.
              </p>
            </div>

            <div>
              <label htmlFor="damageType" className={labelClass}>
                Type of Damage
              </label>

              <select
                id="damageType"
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className={fieldClass}
              >
                <option>Pothole</option>
                <option>Broken Road</option>
                <option>Waterlogging</option>
                <option>Cracked Surface</option>
                <option>Damaged Manhole</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className={labelClass}>
                Urgency Level
              </label>

              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className={fieldClass}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Describe the Damage *
              </label>

              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={fieldClass}
                placeholder="Describe the road condition and any safety concerns..."
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold leading-6 text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || locating}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-base font-extrabold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={20} className="animate-spin" />
              )}
              {submitting ? 'Submitting Report...' : 'Submit Road Report'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
