"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TierBadge } from "../../components/TierBadge";
import { WhatsAppButton } from "../../components/WhatsAppButton";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterTier, setFilterTier] = useState<string>("all");

  let rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://churnager-production.up.railway.app";
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }
  const API_URL = rawUrl.replace(/\/$/, "");

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoCohorts = async () => {
    setSeeding(true);
    try {
      await fetch(`${API_URL}/seed`, { method: "POST" });
      await fetchAlerts();
    } catch (err) {
      console.error("Error seeding cohorts", err);
      alert("Failed to seed demo cohorts.");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute summary metrics
  const criticalCustomers = alerts.filter((a) => (a.tier || "").toLowerCase() === "critical");
  const highCustomers = alerts.filter((a) => (a.tier || "").toLowerCase() === "high");
  
  const criticalMrr = criticalCustomers.reduce((acc, curr) => acc + (curr.mrr_kes || 0), 0);
  const highMrr = highCustomers.reduce((acc, curr) => acc + (curr.mrr_kes || 0), 0);
  const totalAtRiskMrr = criticalMrr + highMrr;

  // Filter alerts by selected tier
  const filteredAlerts = alerts.filter((a) => {
    if (filterTier === "all") return true;
    return (a.tier || "").toLowerCase() === filterTier.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Churn Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time risk scoring and alert dispatch for M-Pesa billing cohorts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={seedDemoCohorts}
            disabled={seeding}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition disabled:opacity-50 shadow-sm"
          >
            {seeding ? "Seeding..." : "Populate 10 Demo Customers"}
          </button>
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-full transition"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="premium-card p-6 bg-white rounded-3xl border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue At-Risk</span>
          <div className="text-2xl font-black text-slate-900 font-mono">KES {totalAtRiskMrr.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">/ mo</span></div>
          <p className="text-xs text-slate-500">Across critical & high churn risk customers</p>
        </div>

        <div className="premium-card p-6 bg-white rounded-3xl border border-red-100 bg-red-50/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Critical Risk Customers</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs">{criticalCustomers.length}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">KES {criticalMrr.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Requires immediate WhatsApp intervention</p>
        </div>

        <div className="premium-card p-6 bg-white rounded-3xl border border-amber-100 bg-amber-50/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">High Risk Customers</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">{highCustomers.length}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">KES {highMrr.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Evaluating usage drops & payment failures</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          <button
            onClick={() => setFilterTier("all")}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${filterTier === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            All Customers ({alerts.length})
          </button>
          <button
            onClick={() => setFilterTier("critical")}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${filterTier === "critical" ? "bg-red-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Critical ({criticalCustomers.length})
          </button>
          <button
            onClick={() => setFilterTier("high")}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${filterTier === "high" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            High ({highCustomers.length})
          </button>
        </div>
        <span className="text-xs font-semibold text-slate-400">Auto-polling every 10 seconds</span>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-md w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-sm text-slate-500">No customers found for this filter criteria.</p>
            <button
              onClick={seedDemoCohorts}
              disabled={seeding}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition"
            >
              {seeding ? "Populating..." : "Populate 10 Demo Customer Profiles"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">MRR (KES)</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Risk Tier</th>
                  <th className="px-6 py-4">Primary Churn Vector</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{alert.customer_name || "Unknown Customer"}</td>
                    <td className="px-6 py-4 font-medium">{alert.plan || "Standard"} Plan</td>
                    <td className="px-6 py-4 font-mono font-semibold">
                      {(alert.mrr_kes || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold">{Math.round(alert.score || 0)}/100</td>
                    <td className="px-6 py-4">
                      <TierBadge tier={alert.tier || "low"} />
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 capitalize">
                      {alert.signals && alert.signals[0] ? (alert.signals[0].name || alert.signals[0].type || "None").replace(/_/g, " ") : "None"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <WhatsAppButton
                        message={alert.narration || "Alert"}
                        label="WhatsApp Alert"
                        className="!px-3 !py-1 text-xs"
                      />
                      <Link
                        href={`/customer/${alert.customer_id}`}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 underline transition inline-block"
                      >
                        Inspect Risk
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
