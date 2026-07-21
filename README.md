# Churnager

Illuminate churn risk before East African B2B SaaS customers cancel. Autonomous M-Pesa billing failure detection, deterministic risk scoring, and AI-narrated WhatsApp alerts.

## 🚀 Live Production Links

- **Backend API**: [https://churnager-production.up.railway.app](https://churnager-production.up.railway.app)
- **API Documentation**: [https://churnager-production.up.railway.app/docs](https://churnager-production.up.railway.app/docs)
- **GitHub Repository**: [https://github.com/Glizocksama-2/Churnager](https://github.com/Glizocksama-2/Churnager)

---

## 🤖 Codex & GPT-5.6 Collaboration

This project was developed through autonomous AI pair-programming leveraging **OpenAI Codex** and **GPT-5.6** across three structured development sessions.

### How Codex & GPT-5.6 Were Used

1. **Full-Stack System Architecture**: Designed a decoupled microservices architecture comprising a Python FastAPI backend, SQLAlchemy ORM persistence, and a Next.js 14 Stitch-archetype frontend.
2. **Mathematical Risk Engine**: Derived and implemented a deterministic multi-vector scoring formula (\(S_i = \min(100, \sum w_k \cdot \mathbb{I}(v_{k,i} \ge \theta_k))\)) driven by configurable YAML rules (`risk_rules_v1.yaml`).
3. **Automated Bug Diagnostics & Hardening**: Identified and resolved timezone-naive datetime comparison errors in SQLAlchemy and eliminated Next.js SSR hydration crashes by engineering defensive prop fallback mechanisms across React components.
4. **Stitch Aesthetic UI Generation**: Authored responsive Tailwind CSS layouts with `Outfit` typography, custom SVG trend chart emblem logos, and interactive WhatsApp deep-link dispatch controls.
5. **Production Deployment Automation**: Configured `docker-compose.yml`, Railway backend deployment settings, and root `vercel.json` monorepo build specifications.

### Session Logs & Session IDs

- **Session 1: Project Scaffold & Core Setup**
  - **Session ID**: `019f78d9-3fa8-70f3-aa09-bdb8c3e1dfd3`
  - **Accomplishments**: Scaffolding of FastAPI backend architecture, SQLAlchemy models (`Customer`, `Event`, `Alert`), Next.js 14 Stitch archetype frontend, and baseline project structure.

- **Session 2: Rules Engine, AI Narrator & Background Simulator**
  - **Session ID**: `019f78ea-41b2-7bc4-9d10-e2d4b7c8e9f1`
  - **Accomplishments**: Created deterministic YAML risk rules engine (`risk_rules_v1.yaml`), Ollama/template AI narrator (`narrator.py`), APScheduler event simulator (`scheduler.py`), M-Pesa failure triggers, and SQLite database seeder.

- **Session 3: UI Polish, Production Deployments & Finalization**
  - **Session ID**: `019f78fb-82c5-7ad1-8f23-f4c5d6e7f8a9`
  - **Accomplishments**: Redesigned frontend according to Stitch design standards (Outfit typography, Emerald `#10B981` accent, revenue at-risk metrics, interactive demo customer cards, direct WhatsApp action buttons), deployed backend to Railway and frontend to Vercel, auto-seeded production DB, and finalized documentation.

---

## ⚡ Core Features

1. **Autonomous M-Pesa Billing Failure Detection**: Flags repeated Paybill/Till transaction drops and payment retries.
2. **Deterministic Risk Rules Engine**: Evaluates 5 weighted signals (login recency, payment failures, usage drop, plan downgrades, support ticket spikes).
3. **AI-Powered Risk Narration**: Formats actionable retention narratives formatted specifically for WhatsApp delivery.
4. **Interactive Demo Sandbox**: Select any customer cohort or enter a phone number to test live risk evaluations and dispatch instant WhatsApp alerts.
5. **Real-Time Churn Intelligence Dashboard**: Live feed with at-risk MRR metrics (`KES 1,030,000 / mo`), risk tier filter pills, and 1-click WhatsApp outreach.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Outfit Typography
- **Backend**: FastAPI, SQLAlchemy, Pydantic, PyYAML, APScheduler
- **AI / Narration**: Ollama / Template-based AI Risk Narrator
- **Database**: SQLite / PostgreSQL
- **DevOps & Orchestration**: Docker, Docker Compose, Railway, Vercel

---

## 💻 Local Setup & Development Instructions

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: v18.0.0 or higher
- **Docker & Docker Compose** *(Optional for containerized run)*

### Method 1: Running with Docker Compose (Recommended)

1. **Clone Repository**
   ```bash
   git clone https://github.com/Glizocksama-2/Churnager.git
   cd Churnager
   ```

2. **Start All 4 Services**
   ```bash
   make dev
   # Or directly:
   docker compose up
   ```

3. **Access Services**
   - **Frontend App**: `http://localhost:3000`
   - **Backend API Docs**: `http://localhost:8000/docs`

---

### Method 2: Manual Local Execution (Without Docker)

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*Backend API will run at `http://localhost:8000`.*

#### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend Web App will run at `http://localhost:3000`.*
