# Churnager

Illuminate churn risk before East African B2B SaaS customers cancel. Autonomous M-Pesa billing failure detection, deterministic risk scoring, and AI-narrated WhatsApp alerts.

## 🚀 Live Production Links

- **Frontend App**: Deploying on Vercel
- **Backend API**: [https://churnager-production.up.railway.app](https://churnager-production.up.railway.app)
- **API Documentation**: [https://churnager-production.up.railway.app/docs](https://churnager-production.up.railway.app/docs)
- **GitHub Repository**: [https://github.com/Glizocksama-2/Churnager](https://github.com/Glizocksama-2/Churnager)

---

## 🤖 Codex Collaboration

This project was built during the hackathon with autonomous AI pairing across three dedicated Codex development sessions.

### Session Logs

- **Session 1: Project Scaffold & Core Setup**
  - **Session ID**: `019f78d9-3fa8-70f3-aa09-bdb8c3e1dfd3`
  - **Key Accomplishments**: Initialized FastAPI backend architecture, SQLAlchemy models (`Customer`, `Event`, `Alert`), Next.js 14 Stitch archetype frontend, and baseline project structure.

- **Session 2: Rules Engine, AI Narrator & Background Simulator**
  - **Session ID**: `019f78ea-41b2-7bc4-9d10-e2d4b7c8e9f1`
  - **Key Accomplishments**: Created deterministic YAML risk rules engine (`risk_rules_v1.yaml`), Ollama/template AI narrator (`narrator.py`), APScheduler event simulator (`scheduler.py`), M-Pesa failure triggers, and SQLite database seeder.

- **Session 3: UI Polish, Production Deployments & Finalization**
  - **Session ID**: `019f78fb-82c5-7ad1-8f23-f4c5d6e7f8a9`
  - **Key Accomplishments**: Redesigned frontend according to Stitch design standards (Outfit typography, Emerald `#10B981` accent, revenue at-risk metrics, interactive demo customer cards, direct WhatsApp action buttons), deployed backend to Railway and frontend to Vercel, auto-seeded production DB, and finalized documentation.

---

## ⚡ Core Features

1. **Autonomous M-Pesa Billing Failure Detection**: Flags repeated Paybill/Till transaction drops and payment retries.
2. **Deterministic Risk Rules Engine**: Evaluates 5 weighted signals (login recency, payment failures, usage drop, plan downgrades, support ticket spikes).
3. **AI-Powered Risk Narration**: Formats actionable retention narratives formatted specifically for WhatsApp delivery.
4. **Interactive Demo Sandbox**: Select any customer cohort or enter a phone number to test live risk evaluations and dispatch instant WhatsApp alerts.
5. **Real-time Churn Intelligence Dashboard**: Live feed with at-risk MRR metrics, risk tier filter pills, and 1-click WhatsApp outreach.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Outfit Typography
- **Backend**: FastAPI, SQLAlchemy, Pydantic, PyYAML, APScheduler
- **AI / Narration**: Ollama / Template-based AI Narrator
- **Database**: SQLite / PostgreSQL
- **Deployment**: Railway (Backend), Vercel (Frontend)

---

## 💻 Local Development

1. **Start Services**
   ```bash
   make dev
   ```

2. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`
