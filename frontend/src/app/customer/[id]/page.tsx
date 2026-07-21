"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TierBadge } from "../../../components/TierBadge";
import { SignalBar } from "../../../components/SignalBar";
import { NarrationCard } from "../../../components/NarrationCard";
import { WhatsAppButton } from "../../../components/WhatsAppButton";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [handling, setHandling] = useState(false);
  const [phone, setPhone] = useState("");

  let rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://churnager-production.up.railway.app";
  if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }
  const API_URL = rawUrl.replace(/\/$/, "");

  const fetchRiskProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/risk/${params.id}`);
      const data = await res.json();
      setAlertData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markHandled = async () => {
    if (!alertData) return;
    setHandling(true);
    try {
      await fetch(`${API_URL}/alerts/${alertData.id}/handled`, {
        method: "POST",
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to mark handled");
    } finally {
      setHandling(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchRiskProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-md w-1/3"></div>
        <div className="h-48 bg-slate-100 rounded-[2.5rem]"></div>
      </div>
    );
  }

  if (!alertData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-slate-500">
        Customer profile could not be loaded.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Back button */}
      <div>
        <a href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          &larr; Back to Dashboard
        </a>
      </div>

      {/* Header card */}
      <div className="premium-card grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{alertData.customer_name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">{alertData.plan} Plan</span>
            <TierBadge tier={alertData.tier} />
          </div>
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Contract Value</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">KES {alertData.mrr_kes.toLocaleString()} / mo</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-end h-full">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-left">
              Send Alert to Phone #
            </label>
            <input
              type="tel"
              placeholder="e.g. +254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none transition mb-2"
            />
          </div>
          <WhatsAppButton
            phone={phone}
            message={alertData.narration}
            label={phone ? `Send Alert to ${phone}` : "Send to WhatsApp Owner"}
            className="w-full text-center"
          />
          <button
            onClick={markHandled}
            disabled={handling}
            className="px-6 py-3 border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-semibold rounded-full transition w-full disabled:opacity-50"
          >
            {handling ? "Processing..." : "Mark as Handled"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Signal breakdown */}
        <div className="md:col-span-6 premium-card space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Churn Signal Vectors</h2>
          {alertData.signals.length === 0 ? (
            <p className="text-sm text-slate-500">No active signals contributing to churn risk.</p>
          ) : (
            <div className="space-y-4">
              {alertData.signals.map((sig: any, idx: number) => (
                <SignalBar
                  key={idx}
                  name={sig.name || sig.type || "Signal"}
                  weight={sig.weight || 10}
                  value={(sig.weight || 10) * 2} // display scaled score
                />
              ))}
            </div>
          )}
        </div>

        {/* Narrative / Output */}
        <div className="md:col-span-6">
          <NarrationCard narration={alertData.narration} />
        </div>
      </div>
    </div>
  );
}
