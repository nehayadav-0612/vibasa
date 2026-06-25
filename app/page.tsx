'use client'

import { useMemo } from 'react'

const kpi = {
  totalResidents: 12472,
  totalWards: 32,
  activeCollectors: 18,
  collectionsToday: 451,
  pendingIssues: 12,
}

const stats = [
  { label: 'Total Residents', value: kpi.totalResidents, color: 'text-emerald-700' },
  { label: 'Total Wards', value: kpi.totalWards, color: 'text-sky-700' },
  { label: 'Active Collectors', value: kpi.activeCollectors, color: 'text-teal-700' },
  { label: 'Collections Today', value: kpi.collectionsToday, color: 'text-lime-700' },
  { label: 'Pending Issues', value: kpi.pendingIssues, color: 'text-amber-700' },
]

export default function Page() {
  const revenueData = useMemo(
    () => [
      { month: 'Jan', value: 18 },
      { month: 'Feb', value: 26 },
      { month: 'Mar', value: 31 },
      { month: 'Apr', value: 29 },
      { month: 'May', value: 38 },
      { month: 'Jun', value: 44 },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 bg-slate-900 text-white p-6 hidden md:block">
          <div className="mb-8">
            <div className="text-2xl font-bold">Vibasa</div>
            <p className="mt-2 text-slate-300">Supervisor Dashboard</p>
          </div>
          <nav className="space-y-3 text-sm">
            <a href="#overview" className="block rounded-xl bg-slate-800 px-4 py-3">Overview</a>
            <a href="#collectors" className="block rounded-xl px-4 py-3 hover:bg-slate-800">Collectors</a>
            <a href="#residents" className="block rounded-xl px-4 py-3 hover:bg-slate-800">Residents</a>
            <a href="#issues" className="block rounded-xl px-4 py-3 hover:bg-slate-800">Issues</a>
            <a href="#billing" className="block rounded-xl px-4 py-3 hover:bg-slate-800">Billing</a>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Welcome back, Supervisor</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Vibasa Smart Waste Dashboard</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Sync Data</button>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Create Report</button>
            </div>
          </header>

          <section id="overview" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className={`mt-5 text-4xl font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Statistics</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Collection trend</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Live</span>
              </div>

              <div className="mt-8 space-y-4">
                {revenueData.map((row) => (
                  <div key={row.month} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                    <div>
                      <p className="text-sm text-slate-500">{row.month}</p>
                      <p className="text-xl font-semibold text-slate-900">{row.value}k kg</p>
                    </div>
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.value * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ward summary</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Ward coverage</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Stable</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Wards served</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">32</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Collectors online</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">18</p>
                </div>
              </div>
            </div>
          </section>

          <section id="issues" className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Issues</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Pending action items</h2>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{kpi.pendingIssues} open</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Overflowing bin reported</p>
                  <p className="mt-1 text-sm text-slate-500">Ward 12 — needs cleanup crew</p>
                </li>
                <li className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Collector assignment delay</p>
                  <p className="mt-1 text-sm text-slate-500">Ward 05 — reassign required</p>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Billing</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Monthly overview</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">June</span>
              </div>
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Outstanding charges</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">₹2.1M</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Invoices generated</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">4,820</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
