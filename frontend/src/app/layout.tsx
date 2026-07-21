import React from "react";
import "./globals.css";

export const metadata = {
  title: "Churnager - Autonomous Churn Intelligence",
  description: "Illuminate churn risk for M-Pesa B2B SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">C</span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Churnager</span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Home</a>
              <a href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Dashboard</a>
            </nav>
          </div>
        </header>
        <main className="flex-grow">{children}</main>
        <footer className="border-t border-slate-100 bg-white py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Churnager. Built for East African B2B SaaS.
          </div>
        </footer>
      </body>
    </html>
  );
}
