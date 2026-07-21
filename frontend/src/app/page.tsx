"use client";

import React, { useState } from "react";
import { WhatsAppButton } from "../components/WhatsAppButton";

export default function LandingPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://churnager-production.up.railway.app";

  const triggerTestAlert = async () => {
    setLoading(true);
    try {
      // Send alert for Customer 1 (which is seeded by default)
      const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            customer_id: 1,
            type: "payment_failed",
            props: { amount: 128000, trigger: "manual_test" },
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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-7 space-y-8 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xs tracking-wide">
          B2B Churn Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Illuminate Churn Risk Before They Cancel
        </h1>
        <p className="text-lg text-slate-600 max-w-[55ch] leading-relaxed">
          Angaza connects customer M-Pesa billing alerts and usage telemetry to predict customer churn risks, sending actionable alerts directly to your Slack or WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <WhatsAppButton
            message="START"
            label="Connect WhatsApp"
            className="sm:w-auto"
          />
          <button
            onClick={triggerTestAlert}
            disabled={loading}
            className="px-6 py-3 border border-slate-300 hover:border-slate-400 text-sm font-semibold rounded-full bg-white text-slate-800 transition sm:w-auto disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Test Alert"}
          </button>
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="premium-card space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-4">
            Alert Sandbox
          </h3>
          {testResult ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">{testResult.customer_name}</span>
                <span className="capitalize text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  {testResult.tier}
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs font-mono whitespace-pre-wrap text-slate-700">
                {testResult.narration}
              </div>
              <a
                href={`/customer/${testResult.customer_id}`}
                className="block text-center text-xs font-bold text-accent hover:text-accent-dark transition pt-2"
              >
                View Risk Profile
              </a>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-500">
              No alert sent yet. Click Send Test Alert to trigger a mock churn event.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
