'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Search,
  Building2,
  UserCheck,
  FileCheck2,
  Eye,
  Camera,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackMessage, setTrackMessage] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackMessage(
      'Live complaint lookup is not available yet. This prototype is not connected to a backend database, and no live complaint records currently exist.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Civic Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <p className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span>Prototype Under Development &mdash; Platform Architecture &amp; Design Preview</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#transparency" className="hover:text-slate-100 transition-colors">
              Verification Standards
            </a>
            <span className="text-slate-700" aria-hidden="true">|</span>
            <a href="#faq" className="hover:text-slate-100 transition-colors">
              Platform FAQ
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Wordmark Logo */}
            <Link
              href="#hero"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md p-1"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm border border-slate-800">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <span className="w-3.5 h-0.5 bg-amber-500 rounded-full" />
                  <span className="w-4.5 h-0.5 bg-white rounded-full" />
                  <span className="w-3.5 h-0.5 bg-emerald-600 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    Sadak-Settu
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Prototype
                  </span>
                </div>
                <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
                  Civic Road Audit Concept
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
              <a
                href="#hero"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#transparency"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                Transparency
              </a>
              <a
                href="#track-section"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                Track Status
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                FAQ
              </a>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#login-notice"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors rounded-lg hover:bg-slate-100"
              >
                Official Login
              </a>
              <a
                href="#report-notice"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                Report Road Damage (Coming Soon)
              </a>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-900"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3">
            <nav className="flex flex-col space-y-1">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="#transparency"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                Transparency
              </a>
              <a
                href="#track-section"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                Track Status
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="#report-notice"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm"
              >
                Report Road Damage (Coming Soon)
              </a>
              <a
                href="#login-notice"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Official Login
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="relative bg-white border-b border-slate-200 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Early Prototype &mdash; Feature Specifications Under Development
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight sm:leading-[1.15]">
                Civic road repair tracking designed around verifiable visual evidence.
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                Sadak-Settu is a proposed civic platform being designed to connect citizens, municipal departments, and independent verifiers. The planned system intends to document road damage, track repair progression, and require photographic quality verification before complaints can be resolved.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="#report-notice"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-base shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                >
                  <span>Report Road Damage (Coming Soon)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#track-section"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-medium text-base border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Track Status (Preview)</span>
                </a>
              </div>

              {/* Proposed Architecture Principles */}
              <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Planned Geotagging</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Designed to capture precise coordinates alongside photos during reporting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Planned Department Routing</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Proposed routing mechanism for responsible maintenance divisions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Planned Independent Review</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Proposed requirement for third-party photo checks before ticket closure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-700">Proposed Architecture</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-1">
                Planned Three-Role Workflow
              </h2>
              <p className="mt-3 text-base text-slate-600">
                The platform design proposes separating damage identification, field remediation, and completion sign-off into three distinct roles.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Role 1: Citizen */}
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-6">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-700">Role 1</span>
                    <h3 className="text-xl font-semibold text-slate-900">Citizen</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Designed for residents to document road hazards such as potholes or subsidence on local streets and highways.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Upload photos of road damage (planned feature)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Receive a unique reference number to track status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Review milestone updates through resolution stages</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  Design Goal: Streamlined public damage reporting
                </div>
              </div>

              {/* Role 2: Department Officer */}
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-6">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-700">Role 2</span>
                    <h3 className="text-xl font-semibold text-slate-900">Department Officer</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Designed for municipal and road maintenance engineers to review assigned requests and coordinate repairs.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Review location details and assign maintenance priorities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Dispatch work orders to field maintenance teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Submit post-repair photographic records upon completion</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  Design Goal: Accountable field execution
                </div>
              </div>

              {/* Role 3: Independent Verification Officer */}
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-6">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-700">Role 3</span>
                    <h3 className="text-xl font-semibold text-slate-900">Verification Officer</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Designed for independent quality reviewers to inspect submitted repair evidence prior to ticket closure.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Review initial and post-repair photos for consistency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Check visual evidence against quality and finish guidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Approve ticket resolution or request remediation for sub-par work</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  Design Goal: Independent quality assurance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Section */}
        <section id="transparency" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Transparency Model</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-1">
                  Evidence-based repair verification concept.
                </h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  Sadak-Settu proposes a verification structure intended to prevent unilateral closure of repair tickets. By requiring photographic comparison and separate review steps, the design aims to raise accountability standards for public infrastructure maintenance.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Before-and-After Photo Comparison</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        The workflow is designed to pair initial citizen reports directly with completion photos taken from matching perspectives.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Separation of Execution and Sign-off</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        The architecture proposes that repair teams mark tasks ready for review, while sign-off is reserved for separate verification officers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Auditable Stage Progression</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Every stage change &mdash; from initial submission to final sign-off &mdash; is structured to log timestamped milestones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Workflow Ledger Card */}
              <div className="lg:col-span-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-slate-700" />
                      <span className="text-sm font-bold text-slate-800">Proposed Verification Flow</span>
                    </div>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Design Specification
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Phase 1: Damage Intake</div>
                          <div className="text-sm font-semibold text-slate-900">Citizen Submits Photographic Report</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="p-4 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">Phase 2: Department Execution</div>
                          <div className="text-sm font-semibold text-slate-900">Maintenance Crew Uploads Repair Photo</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="p-4 rounded-lg bg-white border-2 border-emerald-600 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <div>
                          <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wide">Phase 3: Verification Audit</div>
                          <div className="text-sm font-semibold text-slate-900">Visual Quality Review &amp; Resolution</div>
                        </div>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Planned for public visibility
                    </span>
                    <span>Multi-stage audit model</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track a Complaint Section */}
        <section id="track-section" className="py-16 bg-slate-100 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">Interface Preview</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Track a Complaint Reference
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              This section previews how citizens and auditors will be able to query progress milestones once backend systems and database services are implemented.
            </p>

            {/* Clear Status Notice */}
            <div className="mt-6 max-w-xl mx-auto p-4 bg-amber-50 border border-amber-300 rounded-lg text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Lookup Disabled in Prototype
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Live complaint lookup is not available yet. This prototype does not connect to a live database, and no actual complaint records are currently stored or retrievable.
                </p>
              </div>
            </div>

            <form onSubmit={handleTrackSubmit} className="mt-6 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <label htmlFor="complaint-id" className="sr-only">
                    Complaint Reference Number
                  </label>
                  <input
                    id="complaint-id"
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Reference lookup (e.g., SDR-2026-KA-0941)"
                    className="w-full px-4 py-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                >
                  Check Status
                </button>
              </div>

              {trackMessage && (
                <div
                  role="status"
                  className="mt-4 p-3.5 rounded-lg bg-white border border-amber-200 text-amber-900 text-sm flex items-start gap-2 text-left shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-relaxed">{trackMessage}</span>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Prototype Implementation Status Notices */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Report Notice Card */}
              <div id="report-notice" className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold mb-4">
                    <span>Feature Status</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>Coming Soon</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Citizen Damage Reporting
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    The complaint submission workflow is not yet active. Camera access, GPS coordinates capture, and image storage will be implemented in future development phases.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    disabled
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-200 rounded-md cursor-not-allowed"
                  >
                    Reporting Form (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Login Notice Card */}
              <div id="login-notice" className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-xs font-semibold mb-4">
                    <span>Feature Status</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>Not Operational</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Department &amp; Auditor Login
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Authentication and dashboard access are not operational. Login portals, credential provisioning, and role-based permissions are planned for later stages.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    disabled
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-200 rounded-md cursor-not-allowed"
                  >
                    Login Portal (Under Development)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section id="faq" className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">Information Desk</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Information regarding project scope, current development status, and planned features.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  What is the current status of Sadak-Settu?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Sadak-Settu is currently an early concept prototype. The live features &mdash; including complaint submission, camera access, GPS tagging, database persistence, official department routing, and live tracking &mdash; are not operational at this stage.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  Is Sadak-Settu affiliated with any government department?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  No. Sadak-Settu is an independent civic-tech prototype project. It is not affiliated with, endorsed by, or connected to any municipal corporation, state public works department, or government ministry.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  How is duplicate reporting planned to be handled in the future?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  The planned architecture includes a design for coordinate-based clustering, where submissions within a close geographic radius would be grouped under a shared review ticket. This feature is part of the planned design and is not currently operational.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  Who will serve as Independent Verification Officers?
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  In the proposed platform model, verification officers are envisioned as independent technical evaluators or accredited third-party inspectors who are separate from maintenance contractors. Independent verification is not currently active.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 & 2: Brand & Purpose */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <span className="font-bold text-xs tracking-wider">SS</span>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Sadak-Settu</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  Prototype
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                An early civic-tech prototype demonstrating a design for transparent road maintenance tracking and visual audit workflows.
              </p>
              <div className="mt-4 text-xs text-slate-500 border-l-2 border-slate-700 pl-3">
                Disclaimer: Sadak-Settu is a conceptual prototype under development. It is not connected to official emergency systems or government databases. For active road hazards requiring immediate attention, contact local municipal emergency helplines directly.
              </div>
            </div>

            {/* Col 3: Navigation Anchors */}
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Prototype Sections
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#hero" className="hover:text-white transition-colors">
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Proposed Roles
                  </a>
                </li>
                <li>
                  <a href="#transparency" className="hover:text-white transition-colors">
                    Transparency Concept
                  </a>
                </li>
                <li>
                  <a href="#track-section" className="hover:text-white transition-colors">
                    Track Status (Preview)
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Project FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform Design Principles */}
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Project Information
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Development Roadmap
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Verification Specifications
                  </a>
                </li>
                <li>
                  <a href="#report-notice" className="hover:text-white transition-colors">
                    Reporting Scope (Planned)
                  </a>
                </li>
                <li>
                  <a href="#login-notice" className="hover:text-white transition-colors">
                    Official Access (Planned)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {currentYear} Sadak-Settu. Civic tech prototype under development.
            </p>
            <p className="text-center sm:text-right">
              Not affiliated with any government ministry, municipal corporation, or public authority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}