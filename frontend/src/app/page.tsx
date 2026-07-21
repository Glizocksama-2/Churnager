"use client";

import React, { useState } from "react";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { TierBadge } from "../components/TierBadge";
import { SignalBar } from "../components/SignalBar";

export default function LandingPage() {
  const [phone, setPhone] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(1);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  let rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://churnager-production.up.railway.app";
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }
  const API_URL = rawUrl.replace(/\/$/, "");

  const triggerTestAlert = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            customer_id: Number(selectedCustomerId),
            type: "payment_failed",
            props: { amount: 145000, trigger: "interactive_demo" },
          },
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
      alert(`Failed to connect to backend at ${API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
      {/* Hero section with asymmetric split */}
      <div className="grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs tracking-wide">
            Autonomous M-Pesa Churn Intelligence
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Illuminate Churn Risk Before B2B SaaS Customers Cancel.
          </h1>

          <p className="text-base text-slate-600 leading-[1.65] max-w-xl">
            Detect hidden billing failures, recency drops, and support spikes across East African SaaS cohorts. Deliver instant AI-narrated retention alerts directly to your team on WhatsApp.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/dashboard"
              className="px-8 py-3.5 bg-slate-900 text-white font-bold text-sm rounded-full shadow-lg hover:bg-slate-800 transition"
            >
              Open Live Dashboard &rarr;
            </a>
          </div>
        </div>

        {/* Interactive Demo Sandbox Card */}
        <div className="md:col-span-6">
          <div className="premium-card bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-diffused space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Run Live Demo Alert</h2>
              <p className="text-xs text-slate-500 mt-1">
                Simulate an M-Pesa billing failure event and dispatch an AI risk narration to your WhatsApp.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Your WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +254712345678 or 2547..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Target Customer Cohort
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-semibold"
                >
                  <option value={1}>Customer 1: Safaricom Agent Portal (Scale Plan - KES 480k/mo)</option>
                  <option value={2}>Customer 2: Kilimall Logistics Hub (Growth Plan - KES 180k/mo)</option>
                  <option value={3}>Customer 3: Twiga Distributors Ltd (Growth Plan - KES 150k/mo)</option>
                  <option value={4}>Customer 4: Boma Capital Managers (Pro Plan - KES 220k/mo)</option>
                  <option value={5}>Customer 5: Soko Retailers Kenya (Starter Plan - KES 45k/mo)</option>
                </select>
              </div>

              <button
                onClick={triggerTestAlert}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? "Evaluating Risk Signals..." : "Trigger Live Risk Evaluation"}
              </button>
            </div>

            {/* Test result output */}
            {testResult && (
              <div className="pt-4 border-t border-slate-100 space-y-4 text-left animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target</span>
                    <span className="text-base font-bold text-slate-900">{testResult.customer_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Risk Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900">{Math.round(testResult.score)}/100</span>
                      <TierBadge tier={testResult.tier} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Risk Narration</span>
                  <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {testResult.narration}
                  </p>
                </div>

                <WhatsAppButton
                  phone={phone}
                  message={testResult.narration}
                  label={phone ? `Send Alert to ${phone}` : "Open Alert in WhatsApp"}
                  className="w-full text-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="space-y-6 text-left">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Built for East African SaaS Operations</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="premium-card p-6 bg-white rounded-2xl border border-slate-200/70 space-y-3">
            <h3 className="text-base font-bold text-slate-900">M-Pesa Failure Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically flags repeated M-Pesa till/Paybill transaction drops and billing failures before account cancellation occurs.
            </p>
          </div>
          <div className="premium-card p-6 bg-white rounded-2xl border border-slate-200/70 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Deterministic Risk Rules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates 5 core signals: login recency, payment failures, usage drop, plan downgrades, and support ticket spikes.
            </p>
          </div>
          <div className="premium-card p-6 bg-white rounded-2xl border border-slate-200/70 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Instant WhatsApp Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No complex portal logins required. Key decision makers receive structured AI narrations directly on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
