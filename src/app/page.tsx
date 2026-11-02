"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  UserRound,
  MapPin,
  Camera,
  ClipboardCheck,
  Construction,
  Route,
  Landmark,
  Activity,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  Building2,
  FileCheck2,
  Award,
} from "lucide-react";

const milestones = [
  {
    number: "01",
    title: "National Highways Development",
    description:
      "Strategic highway expansion facilitating high-speed economic corridors and regional connectivity.",
    tag: "Connectivity",
    icon: Route,
  },
  {
    number: "02",
    title: "Bharatmala Pariyojana",
    description:
      "Flagship infrastructure program optimizing logistics freight efficiency and border corridors.",
    tag: "Highway Development",
    icon: Construction,
  },
  {
    number: "03",
    title: "PM Gati Shakti Master Plan",
    description:
      "Transformative multimodal connectivity network ensuring synchronized execution across ministries.",
    tag: "Integrated Infrastructure",
    icon: Activity,
  },
];

const features = [
  {
    icon: Camera,
    title: "Geo-tagged Live Reporting",
    description:
      "Citizens capture live on-site photos with auto-detected GPS coordinates (latitude, longitude, and district).",
  },
  {
    icon: Building2,
    title: "District-wise Task Allocation",
    description:
      "Complaints route directly to the designated district repair division for rapid on-ground action.",
  },
  {
    icon: ClipboardCheck,
    title: "Transparent Quality Audit",
    description:
      "Independent district monitoring committee inspects repair evidence and costing before closure.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackRef, setTrackRef] = useState("");

  const closeMenu = () => setMobileMenuOpen(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackRef.trim()) {
      window.location.href = `/login?mode=citizen&ref=${encodeURIComponent(trackRef.trim())}`;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top National Strip */}
      <div className="bg-slate-950 px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>GOVERNMENT OF INDIA PROPOSAL INITIATIVE</span>
            <span className="hidden text-slate-500 sm:inline">|</span>
            <span className="hidden text-slate-400 sm:inline">
              Viksit Bharat 2047: Road Quality & Governance
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>District PWD & NHAI Coordination</span>
          </div>
        </div>
      </div>

      {/* Tricolour Ribbon Line */}
      <div className="grid h-1.5 grid-cols-3">
        <div className="bg-[#FF9933]" />
        <div className="bg-white" />
        <div className="bg-[#138808]" />
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
              <Construction size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  सड़क<span className="text-orange-600">-SETTU</span>
                </span>
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800">
                  CIVIC-GOV
                </span>
              </div>
              <span className="block text-[11px] font-medium text-slate-500">
                National Road Grievance Redressal & Quality Audit
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#home"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Home
            </a>
            <a
              href="#leadership"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              National Vision
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Redressal Workflow
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Core Architecture
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login?mode=citizen"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <UserRound size={15} className="text-orange-600" />
              Citizen Login
            </Link>
            <Link
              href="/login?mode=official"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <ShieldCheck size={15} className="text-emerald-400" />
              Department / Official Portal
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <a
                href="#home"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Home
              </a>
              <a
                href="#leadership"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                National Vision
              </a>
              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Redressal Workflow
              </a>
              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Core Architecture
              </a>

              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/login?mode=citizen"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-xs font-bold text-slate-800"
                >
                  <UserRound size={16} />
                  Citizen Login
                </Link>
                <Link
                  href="/login?mode=official"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white"
                >
                  <ShieldCheck size={16} />
                  Official Login
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=85')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-900/80" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-300">
                <Award size={14} className="text-orange-400" />
                Empowering India&apos;s Next-Gen Road Infrastructure
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Accountable Roads,
                <span className="block bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                  Transparent Governance.
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                <strong>Sadak-Settu</strong> bridges Indian citizens with district
                road repair departments and statutory monitoring committees.
                Report damaged roads with geo-tagged proof and track progress
                until verified closure.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login?mode=citizen"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
                >
                  File Road Complaint
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/login?mode=official"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-800"
                >
                  <ShieldCheck size={17} className="text-emerald-400" />
                  Official Department Login
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Live GPS & District Isolation
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Evidence-based Repair Costing
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Independent Monitoring Approval
                </span>
              </div>
            </div>

            {/* Quick Track Complaint Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Track Complaint Status
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter your grievance reference number
                  </p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="complaintRef"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Complaint ID / Reference Number
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      id="complaintRef"
                      type="text"
                      placeholder="e.g. SETTU-2026-BXR-0042"
                      value={trackRef}
                      onChange={(e) => setTrackRef(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-white"
                >
                  Track Status in Citizen Dashboard
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">Workflow Resolution Speed</span>
                  <span className="text-emerald-400 font-bold">Fast-Track</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                  Complaints automatically align to same-district repair and
                  monitoring teams to eliminate jurisdictional delays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP & NATIONAL VISION SECTION */}
      <section
        id="leadership"
        className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-800">
              National Infrastructure Leadership
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Inspired by the Vision of World-Class Indian Highways
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Aligned with the Government of India&apos;s goal of robust highway
              connectivity, zero fatal blackspots, and digital transparency.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Hon'ble PM Narendra Modi */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_Narendra_Modi_in_February_2023.jpg/800px-Prime_Minister_Narendra_Modi_in_February_2023.jpg"
                  alt="Shri Narendra Modi, Hon'ble Prime Minister of India"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-lg font-black">Shri Narendra Modi</p>
                  <p className="text-xs text-orange-300 font-medium">
                    Hon&apos;ble Prime Minister of India
                  </p>
                </div>
              </div>
              <div className="p-6">
                <blockquote className="border-l-4 border-orange-500 pl-4 text-sm italic leading-relaxed text-slate-700">
                  &ldquo;Infrastructure is the foundation of self-reliant India.
                  High quality, durable roads in every district and village are
                  imperative to achieve the dream of Viksit Bharat 2047.&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Vision: PM Gati Shakti</span>
                  <span className="text-orange-700 font-bold">Viksit Bharat 2047</span>
                </div>
              </div>
            </div>

            {/* Hon'ble Minister Nitin Gadkari */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Nitin_Gadkari_cabinet_minister.jpg/800px-Nitin_Gadkari_cabinet_minister.jpg"
                  alt="Shri Nitin Gadkari, Hon'ble Minister for Road Transport & Highways"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-lg font-black">Shri Nitin Gadkari</p>
                  <p className="text-xs text-emerald-300 font-medium">
                    Hon&apos;ble Minister for Road Transport & Highways (MoRTH)
                  </p>
                </div>
              </div>
              <div className="p-6">
                <blockquote className="border-l-4 border-emerald-600 pl-4 text-sm italic leading-relaxed text-slate-700">
                  &ldquo;Quality road infrastructure and timely maintenance are
                  non-negotiable. Modern technology and citizen oversight ensure
                  pothole-free, accountable highways across India.&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Initiative: Bharatmala & Safety First</span>
                  <span className="text-emerald-700 font-bold">MoRTH Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Architecture */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Three-Tier Synchronized Portals
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Role-Based Access Control (RBAC) designed for citizens, local repair
              crews, and quality assurance inspectors.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Citizen */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <UserRound size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  1. Citizen Grievance Portal
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Sign up via OTP/Email. Click live damaged road photos with
                  auto GPS pin, submit complaints, and track redressal progress.
                </p>
              </div>
              <Link
                href="/login?mode=citizen"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500"
              >
                Citizen Sign In <ArrowRight size={14} />
              </Link>
            </div>

            {/* Repair Department */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Construction size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  2. Road Repair Division
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  District PWD & contract teams view district-specific issues,
                  record repairs, upload completion proof, and report costing.
                </p>
              </div>
              <Link
                href="/login?mode=official"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Department Access <ArrowRight size={14} />
              </Link>
            </div>

            {/* Monitoring Department */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  3. Quality & Monitoring Board
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Independent district monitoring committee audits repaired road
                  quality. Approves resolution or commands rework with notes.
                </p>
              </div>
              <Link
                href="/login?mode=official"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
              >
                Monitoring Access <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works workflow */}
      <section
        id="how-it-works"
        className="border-t border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Closed-Loop Redressal Workflow
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              From Citizen Click to Statutory Approval
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Eliminating file pendency through structured digital handovers in
              the same district.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Citizen Submission",
                desc: "Live camera capture extracts location coordinates and assigns unique complaint ID.",
                icon: Camera,
              },
              {
                step: "02",
                title: "District Repair Review",
                desc: "Local road repair team mobilizes work and uploads post-repair photo + expenditure note.",
                icon: Construction,
              },
              {
                step: "03",
                title: "Quality Verification",
                desc: "District Monitoring Officer inspects the repaired proof against standard quality benchmarks.",
                icon: ShieldCheck,
              },
              {
                step: "04",
                title: "Closure or Rework",
                desc: "Approved reports mark complaint resolved; sub-par repairs are returned with mandatory rework notice.",
                icon: FileCheck2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-orange-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-orange-300">
                      {item.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              GovTech Architecture
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Speed & Public Trust
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* National Portals & External References */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Landmark size={24} className="text-orange-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  National Infrastructure References & Guidelines
                </p>
                <p className="text-xs text-slate-500">
                  Official specifications benchmarked from MoRTH & NHAI
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://morth.nic.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Ministry of Road Transport & Highways (MoRTH)
                <ExternalLink size={13} />
              </a>
              <a
                href="https://www.nhai.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                NHAI Portal
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Construction size={22} className="text-orange-500" />
              <span className="text-lg font-black tracking-tight">सड़क-SETTU</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              An institutional civic proposal for automated road grievance
              allocation, contractor accountability, and monitoring quality audit.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Portals
            </h4>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <Link href="/login?mode=citizen" className="hover:text-white">
                Citizen Grievance Filing
              </Link>
              <Link href="/login?mode=official" className="hover:text-white">
                Road Repair Department Login
              </Link>
              <Link href="/login?mode=official" className="hover:text-white">
                Monitoring Authority Login
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Framework & Security
            </h4>
            <p className="mt-3 text-xs text-slate-400">
              Built on Next.js 15+ & Supabase Auth. District Row-Level Security
              (RLS) enforced across citizen and official data stores.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 Sadak-Settu. Civic Governance & Road Infrastructure Initiative.</p>
            <p>Designed for Digital India & Viksit Bharat 2047 Presentation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}