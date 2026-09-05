# JanSahaya — Societal Innovation Collaboration Portal
### Problem Statement: **SIH26043** | Govt. of Jharkhand | Disaster Management | Software

> **Built for Smart India Hackathon 2026.** A production-ready, full-stack crowdsourcing and collaborative problem-solving platform where citizens, universities, researchers, and industry CSR partners unite to tackle real-world disaster and societal challenges across all Indian districts.

---

## 🏛️ Platform Overview

JanSahaya (जनसहाय — "People's Support & Resolution") is a national-grade digital infrastructure that:

- **Citizens** report ground-level societal problems with GPS, photos, and voice (Hindi/English)
- **AI/NLP** auto-classifies the challenge, detects duplicates, and scores urgency in real-time
- **Government officers** verify, triage, and assign challenges to empaneled universities with printable official certificates
- **Researchers & Labs** receive explainability-ranked matched challenges and submit stage-gated solution proposals
- **Industry CSR partners** co-sponsor pilots under Section 135, pledge capital, and officially endorse deployed solutions
- **Mentors & Reviewers** evaluate proposals with a 5-axis rubric scoring dashboard
- **Everyone** can track progress through an interactive GIS disaster heatmap and gamified leaderboard

---

## 🎯 7 Core Differentiators Implemented

| # | Differentiator | Implementation Location |
|---|----------------|------------------------|
| 1 | **Intelligent Duplicate Detection** | TF-IDF + N-gram cosine similarity engine (`src/lib/nlp/tfidf.ts`); live warning banner at challenge intake |
| 2 | **Automatic AI Classification** | Keyword-based categorizer with urgency scoring 1–100 (`src/lib/nlp/classifier.ts`); runs on every POST |
| 3 | **Expertise-Based Solver Matching** | Multi-factor explainable match algorithm (`src/lib/nlp/matcher.ts`); Solver Dashboard shows ranked feed |
| 4 | **Voice Transcription & Hindi/English** | Web Speech API voice dictation modal (`src/components/voice-input-modal.tsx`); full EN↔HI i18n (`src/lib/i18n/index.ts`) |
| 5 | **Government-Aided Workflows** | Verification console with printable statutory certificate (`/admin/verify/[id]`); audit trail in DB |
| 6 | **Dynamic Animations** | Framer Motion transitions, Tailwind custom keyframes, pulsing Leaflet markers across all pages |
| 7 | **Gamified Celebratory Effects** | `canvas-confetti` multi-burst, Web Audio procedural chimes (`src/lib/sound.ts`), badge unlock modals |

---

## 🗂️ 3-Tier Architecture & Technology Stack

| Layer | Technology & Role |
|-------|-------------------|
| **Backend API & AI** | **Python (FastAPI)** (`backend/main.py`) — Asynchronous REST API, OpenAPI docs at `/docs`, JWT/cookie auth, Pydantic validation |
| **AI / NLP Intelligence** | **Scikit-Learn + Python NLP** (`backend/app/services/ai/`) — TF-IDF N-gram duplicate detection, severity/urgency scoring (1–100), explainable solver matching, Gemini summarizer |
| **Database** | **PostgreSQL 16** — SQLAlchemy 2.0 ORM, ACID relational models, automatic table generation, full seed script |
| **Frontend UI** | **React 18 / Next.js** (`src/`) — Transparent proxy rewrites to FastAPI, Leaflet GIS heatmap, Framer Motion animations, Recharts, Tailwind CSS |
| **Containerization** | **Docker Compose** (`docker-compose.yml`) — One-command orchestration for PostgreSQL + FastAPI + React |

---

## 🚀 Quick Start
 
### Option A: One-Command Start with Docker Compose (Recommended)
```bash
# Starts PostgreSQL (5432) + Python FastAPI (8000) + React (3000)
docker compose up
```
- Open Frontend: [http://localhost:3000](http://localhost:3000)
- Open Interactive FastAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Development

#### 1. Start Python (FastAPI) Backend:
```bash
# Windows 1-click script (sets up virtualenv & dependencies automatically):
start_backend.bat

# Or manually:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start React Frontend:
```bash
# In the root directory:
npm install
npm run dev
```

#### Or Start Both Together on Windows:
```bash
start_all.bat
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials & 1-Click Role Switcher

The login page (`/login`) features a **1-Click Persona Switcher** — simply click any role card to instantly log in without typing credentials.

| Role | Email | Password | Persona |
|------|-------|----------|---------|
| 🏛️ **Admin** | `admin@demo.in` | `Admin@123` | Sri Rajesh Kumar Sinha — Ranchi Disaster Management Cell |
| 👤 **Citizen** | `citizen@demo.in` | `Citizen@123` | Priya Sharma — Reporter, Ranchi |
| 🔬 **Solver** | `solver@demo.in` | `Solver@123` | Dr. Aarav Mehta — BIT Mesra Disaster Tech Lab |
| 🏭 **Industry** | `industry@demo.in` | `Industry@123` | Tata Steel CSR Foundation, Jamshedpur |

---

## 🗺️ Complete Page Directory

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with live ticker, counters, 4-step workflow, differentiator showcase |
| `/login` | 1-click role switcher + credential form |
| `/register` | Multi-role registration (Citizen / Solver / Industry) |
| `/challenges` | Full catalog with 7-way search/filter (district, category, severity, status) |
| `/challenges/new` | Multi-step challenge intake wizard with voice input & live duplicate detection |
| `/challenges/[id]` | Detailed challenge view with comments, upvotes, solutions list |
| `/map` | Full-screen Leaflet GIS disaster heatmap with pulsing severity markers |
| `/leaderboard` | Gamified solver & university rankings with podium animation |
| `/analytics` | Recharts impact dashboard (category, severity, district, funnel) |

### Admin (Govt Officer) Pages
| Route | Description |
|-------|-------------|
| `/admin` | Command center with challenge triage queue |
| `/admin/duplicates` | Side-by-side duplicate merge console (NLP similarity shown) |
| `/admin/assignments` | University assignment console with AI-suggested routing |
| `/admin/verify/[id]` | Official verification + printable statutory inspection certificate |

### Solver / Researcher Pages
| Route | Description |
|-------|-------------|
| `/solver/dashboard` | AI-matched challenge feed with explainable fit scores + proposal tracker |
| `/solver/profile` | Profile showcase with badges, karma, solution portfolio |

### Solution Pages
| Route | Description |
|-------|-------------|
| `/solutions/[id]` | Full solution workspace: stage-gate milestones, mentor rubric reviews, endorsement |
| `/solutions/compare` | Side-by-side multi-proposal comparison matrix |

### Industry Pages
| Route | Description |
|-------|-------------|
| `/industry` | CSR co-sponsorship portal with pledge modal and 80G grant tracking |

---

## 🔌 REST API Reference

### Auth Endpoints
```
POST /api/auth/register       — Create account (CITIZEN / SOLVER / INDUSTRY / ADMIN)
POST /api/auth/login          — Authenticate and set HTTP-only JWT cookie
POST /api/auth/quick-login    — 1-click demo persona login
GET  /api/auth/me             — Current session user
POST /api/auth/logout         — Clear session
```

### Challenge Endpoints
```
GET  /api/challenges                   — Catalog with ?search, ?district, ?category, ?severity, ?status, ?page
POST /api/challenges                   — Create challenge (runs AI classify + duplicate check)
GET  /api/challenges/[id]             — Single challenge with relations
PUT  /api/challenges/[id]             — Update status / official notes (admin)
POST /api/challenges/[id]/upvote      — Toggle upvote + award karma
GET  /api/challenges/[id]/comments    — List comments
POST /api/challenges/[id]/comments    — Post comment
POST /api/duplicate-check             — Real-time similarity score (title + description)
```

### Admin / NLP Endpoints
```
POST /api/admin/merge         — Merge duplicate challenge into master (rollup votes/comments)
POST /api/admin/assign        — Assign challenge to university
POST /api/admin/verify        — Issue official verification + generate certificate ID
GET  /api/match-solvers       — ?challengeId or ?solverId — ranked explainable matches
```

### Solution Endpoints
```
GET  /api/solutions           — List all solutions
POST /api/solutions           — Submit solution proposal + auto-create milestones
GET  /api/solutions/[id]      — Solution with milestones, reviews, comments
PUT  /api/solutions/[id]      — Update milestone status (admin/mentor)
POST /api/solutions/[id]/review   — Multi-factor rubric scoring review
POST /api/solutions/[id]/endorse  — Issue official government/industry endorsement
```

### Utility Endpoints
```
GET  /api/analytics    — Aggregated metrics for analytics dashboard
GET  /api/universities — List of partnered institutes
POST /api/upload       — Multipart file upload → public/uploads/
```

---

## 🗄️ Database Schema Summary

```
User              — role (ADMIN|CITIZEN|SOLVER|INDUSTRY|MENTOR), karmaPoints, badges
Challenge         — title, description, category, severity, district, GPS, urgencyScore, aiTags
DuplicateMerge    — tracks merge operations with similarity score and audit note
Solution          — abstract, methodology, techStack, budgetEstimate, milestoneStage
Milestone         — order, title, description, status (PENDING|SUBMITTED|APPROVED)
Review            — rating, feasibilityScore, impactScore, costEffectiveness, scalabilityScore
Upvote            — Challenge ↔ User (unique constraint)
Comment           — polymorphic for Challenge and Solution
University        — name, code, district, departments, expertiseTags, nodalOfficerName
Notification      — user, title, body, isRead, type
AuditLog          — action, entityType, entityId, actorId, actorName, details
```

---

## 🌱 Seed Data Summary

Run `npx tsx prisma/seed.ts` to populate:

- **4 core demo users** (Admin, Citizen, Solver, Industry)
- **11 additional solver profiles** — BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University, AIIMS Deoghar, Ranchi University
- **4 industry CSR partners** — Tata Steel, Coal India Green Tech, Jindal Foundation, Infosys Springboard
- **6 partner universities** with departments and nodal officers
- **25 realistic challenges** (16 Jharkhand + 9 National) including:
  - 3 deliberate near-duplicates (Morabadi flood, Jharia coal fire, Palamu fluoride drought) — for demonstrating NLP deduplication
  - Mix of CRITICAL / HIGH / MEDIUM severity across 18 districts
- **Active solutions** with stage-gate milestones, multi-factor rubric reviews, upvotes, and comments

---

## 🏗️ Project Architecture

```
e:\jansamadhan\
├── prisma/
│   ├── schema.prisma          SQLite schema (11 models)
│   └── seed.ts               Comprehensive demo data seeder
│
├── src/
│   ├── app/
│   │   ├── api/              REST API route handlers
│   │   ├── admin/            Govt officer pages
│   │   ├── solver/           Researcher workspace
│   │   ├── solutions/        Solution workspace + compare
│   │   ├── challenges/       Catalog + intake wizard + detail
│   │   ├── analytics/        Recharts dashboard
│   │   ├── industry/         CSR portal
│   │   ├── leaderboard/      Gamified rankings
│   │   ├── map/              Leaflet GIS heatmap
│   │   ├── login/ register/  Auth pages
│   │   ├── layout.tsx        Root layout with navbar/footer
│   │   └── page.tsx          Landing page
│   │
│   ├── components/
│   │   ├── navbar.tsx               Header with 1-click switcher
│   │   ├── footer.tsx               Government informatics footer
│   │   ├── leaflet-map.tsx          Dynamic client-side Leaflet
│   │   ├── celebration-effects.tsx  canvas-confetti triggers
│   │   ├── badge-unlock-modal.tsx   Gamified badge popup
│   │   ├── voice-input-modal.tsx    Web Speech API dictation
│   │   ├── duplicate-alert.tsx      Live NLP warning banner
│   │   ├── explainable-card.tsx     Solver match breakdown card
│   │   └── language-provider.tsx    EN↔HI i18n context
│   │
│   └── lib/
│       ├── db.ts                    Prisma singleton
│       ├── auth.ts                  JWT + bcrypt utilities
│       ├── sound.ts                 Web Audio synthesizer
│       ├── validators.ts            Zod schemas
│       ├── i18n/index.ts            EN + HI localization
│       ├── data/jharkhand-districts.ts  24 districts + GPS
│       └── nlp/
│           ├── tfidf.ts             Duplicate detection engine
│           ├── classifier.ts        Auto categorize + urgency
│           └── matcher.ts           Explainable solver matching
```

---

## 🔒 Security Notes

- Passwords hashed with **bcryptjs** (12 salt rounds)
- Auth via **HTTP-only JWT cookies** (30-day expiry)
- All mutations validate input with **Zod** schemas
- Admin-only API routes check `role === "ADMIN"`
- File uploads restricted to images (`image/*`) with 10 MB limit

---

## 🌐 SIH26043 Problem Statement Mapping

| Requirement | Implementation |
|-------------|---------------|
| Crowdsource societal challenges | `/challenges/new` — multi-step wizard with GPS, photo, voice |
| All districts across India | 24 Jharkhand + all Indian states in `jharkhand-districts.ts` |
| Duplicate challenge detection | Real-time TF-IDF cosine similarity at intake |
| Auto classification | Keyword NLP → category + urgency score |
| University collaboration | University Assignment Console, nodal officer notifications |
| Industry partnerships | CSR Portal with pledge modal and endorsement seals |
| Government verification | Official verification certificate with statutory checklist |
| Multilingual support | Hindi + English with instant toggle |
| GIS visualization | Full-screen Leaflet heatmap with severity pins |
| Analytics | National + Jharkhand Recharts dashboard |
| Gamification | Leaderboard, karma, badges, confetti, fanfare |
| Solver matching | Multi-factor explainable match algorithm |

---

## 📦 Environment Variables

```env
# .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="jansamadhan-sih26043-secure-jwt-secret-key-2024"
NEXT_PUBLIC_APP_NAME="JanSahaya"
NEXT_PUBLIC_APP_TAGLINE="India's Societal Innovation Portal"
```

---

## 🧪 Running Tests

```bash
# Type check
npx tsc --noEmit

# Full production build validation
npm run build

# Development server
npm run dev
```

---

## 🙏 Credits

Built for **Smart India Hackathon 2026** — Problem Statement **SIH26043**  
**Organization:** Government of Jharkhand, Department of Disaster Management  
**Category:** Software | Theme: Disaster Management & Societal Innovation
