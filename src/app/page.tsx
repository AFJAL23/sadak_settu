
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
} from "lucide-react";

const milestones = [
  {
    number: "01",
    title: "National Highways Development",
    description:
      "Highway development initiatives aim to improve connectivity between cities, economic centres and regions.",
    tag: "Connectivity",
    icon: Route,
  },
  {
    number: "02",
    title: "Bharatmala Pariyojana",
    description:
      "A major highway development programme focused on improving freight movement and road connectivity.",
    tag: "Highway development",
    icon: Construction,
  },
  {
    number: "03",
    title: "PM Gati Shakti",
    description:
      "A national master plan that promotes integrated planning of infrastructure and multimodal connectivity.",
    tag: "Integrated infrastructure",
    icon: Activity,
  },
];

const features = [
  {
    icon: Camera,
    title: "Photo-based Reporting",
    description:
      "Submit road damage complaints with a photo and a description of the problem.",
  },
  {
    icon: MapPin,
    title: "Location-based Complaints",
    description:
      "Provide the road location so the responsible team can identify the reported issue.",
  },
  {
    icon: ClipboardCheck,
    title: "Complaint Tracking",
    description:
      "Use your complaint reference to check the current status of a submitted report.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top government-context strip */}
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        SADAK-SETTU
        <span className="mx-2 text-slate-500">|</span>
        Civic Road Damage Reporting & Monitoring Platform
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
              <Construction size={25} />
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-tight">
                Sadak<span className="text-orange-600">-Settu</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Better Roads, Better Connectivity
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
              href="#how-it-works"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Features
            </a>
            <a
              href="#milestones"
              className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Road Milestones
            </a>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login?mode=citizen"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50"
            >
              <UserRound size={16} />
              User Login
            </Link>
            <Link
              href="/login?mode=official"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <ShieldCheck size={16} />
              Official Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <a
                href="#home"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Features
              </a>
              <a
                href="#milestones"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Road Milestones
              </a>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link
                  href="/login?mode=citizen"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold"
                >
                  <UserRound size={17} />
                  User Login
                </Link>
                <Link
                  href="/login?mode=official"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white"
                >
                  <ShieldCheck size={17} />
                  Official Login
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden bg-slate-950">
        <div
  className="absolute inset-0 -z-20 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85')",
  }}
/>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/55" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Citizen participation for better roads
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-300">
              Report. Repair. Monitor.
            </p>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Better Roads,
              <span className="block text-orange-300">Stronger India.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Help identify damaged roads by reporting potholes, broken
              surfaces and other road issues. Submit a complaint and follow
              its progress through one simple platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?mode=citizen"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600"
              >
                Get Started as a Citizen
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/15"
              >
                How It Works
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Photo-based reporting
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Location details
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-green-400" />
                Status tracking
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-orange-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/20 bg-slate-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85"
                alt="Road infrastructure and city connectivity"
                className="h-[300px] w-full object-cover sm:h-[380px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <Route size={26} />
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Every Road Matters
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">
                  Community reporting can help bring road problems to the
                  attention of the responsible teams.
                </p>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                <MapPin className="mb-2 text-orange-300" size={22} />
                <p className="font-bold">Report Locally</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Share the location of a road issue.
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
                <ClipboardCheck className="mb-2 text-green-300" size={22} />
                <p className="font-bold">Track Progress</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Follow complaint status updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tricolour divider */}
      <div className="grid h-1.5 grid-cols-3">
        <div className="bg-orange-500" />
        <div className="bg-white" />
        <div className="bg-green-600" />
      </div>

      {/* Login choices */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UserRound size={23} />
              </div>
              <h2 className="text-xl font-extrabold">Citizen Portal</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Sign in to report road damage, submit evidence and access your
                citizen dashboard.
              </p>
            </div>
            <Link
              href="/login?mode=citizen"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              User Login <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <ShieldCheck size={23} />
              </div>
              <h2 className="text-xl font-extrabold">Official Portal</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Authorised department staff and monitoring personnel can sign
                in to access their role-specific dashboards.
              </p>
            </div>
            <Link
              href="/login?mode=official"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Official Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              One platform, clearer reporting
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Make Road Reporting Simpler
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Capture the issue, provide useful details and follow the report
              through the platform.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-slate-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Simple process
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              From Road Complaint to Monitoring
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A clear workflow connects citizens, repair teams and monitoring
              personnel.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Citizen Reports",
                description:
                  "Submit the road issue with a description, photo and location details.",
                icon: UserRound,
              },
              {
                step: "02",
                title: "Department Reviews",
                description:
                  "Authorised repair staff review reports and update the work status.",
                icon: Construction,
              },
              {
                step: "03",
                title: "Monitoring",
                description:
                  "Monitoring personnel review complaint progress and repair updates.",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.step}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-orange-200">
                      {item.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon size={22} />
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <h3 className="text-xl font-extrabold">
                Have you noticed a damaged road?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Sign in to access the reporting form and submit the details.
              </p>
            </div>
            <Link
              href="/login?mode=citizen"
              className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 sm:mt-0"
            >
              Start Reporting <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Government initiatives and milestones */}
      <section
        id="milestones"
        className="scroll-mt-24 overflow-hidden py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
                India's road infrastructure
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Initiatives Shaping Connectivity
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Explore major national infrastructure programmes that focus on
                highways, logistics and integrated connectivity.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:self-auto">
              <Landmark size={19} className="text-orange-600" />
              Government initiatives
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {milestones.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.number}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="flex items-center justify-between bg-slate-900 p-6 text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                      <Icon size={25} />
                    </div>
                    <span className="text-3xl font-black text-white/25">
                      {item.number}
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                      {item.tag}
                    </span>
                    <h3 className="mt-4 text-xl font-extrabold">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-xs leading-6 text-slate-500">
            These are descriptions of public infrastructure initiatives, not
            claims of work completed by Sadak-Settu. For official programme
            details, consult the Government of India and Ministry of Road
            Transport and Highways websites.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://morth.nic.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Ministry of Road Transport & Highways
              <ExternalLink size={15} />
            </a>
            <a
              href="https://www.nhai.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              NHAI Official Website
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust and role reminder */}
      <section className="border-y border-slate-200 bg-orange-50/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                Separate access for citizens and authorised staff
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Staff access is intended for authorised accounts. Sadak-Settu
                is a civic reporting platform and is not, by itself, an
                official Government of India website.
              </p>
            </div>
          </div>
          <Link
            href="/login?mode=official"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Official Login <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <Construction size={24} />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Sadak-Settu
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              A civic road damage reporting and monitoring platform designed
              to help citizens document road issues and follow their progress.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white">Explore</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a href="#home" className="transition hover:text-white">
                Home
              </a>
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="transition hover:text-white">
                How It Works
              </a>
              <a href="#milestones" className="transition hover:text-white">
                Road Milestones
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">Portal Access</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                href="/login?mode=citizen"
                className="transition hover:text-white"
              >
                User Login
              </Link>
              <Link
                href="/login?mode=official"
                className="transition hover:text-white"
              >
                Official Login
              </Link>
              <Link
                href="/report"
                className="transition hover:text-white"
              >
                Report Road Damage
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>
            © 2026 Sadak-Settu. All rights reserved.
            </p>
            <p>
              A civic reporting platform. Not an official government website.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
