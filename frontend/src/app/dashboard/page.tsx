"use client";

import React, { useEffect, useState } from "react";
import { TierBadge } from "../../components/TierBadge";

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://localhost:8000/alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Churn Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time risk scoring and alert dispatch for M-Pesa billing cohorts.</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-full transition"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-md w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
            <div className="h-10 bg-slate-100 rounded-md w-full"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm">
            No active risk alerts found. Click Send Test Alert on the home page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">MRR (KES)</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Risk Tier</th>
                  <th className="px-6 py-4">Top Signal</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{alert.customer_name}</td>
                    <td className="px-6 py-4 font-medium">{alert.plan}</td>
                    <td className="px-6 py-4 font-mono font-semibold">
                      {alert.mrr_kes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold">{Math.round(alert.score)}</td>
                    <td className="px-6 py-4">
                      <TierBadge tier={alert.tier} />
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 capitalize">
                      {alert.signals[0] ? alert.signals[0].type.replace("_", " ") : "None"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/customer/${alert.customer_id}`}
                        className="text-xs font-bold text-accent hover:text-accent-dark transition"
                      >
                        Inspect Risk
                      </a>
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
