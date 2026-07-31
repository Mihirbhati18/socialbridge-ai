# Concord (formerly SocialBridge AI): Master Tech Architecture & Stack

> **Purpose:** This is the definitive, comprehensive guide to the Concord platform. It maps every feature to its underlying technology, explains the complex logic behind our AI implementations, and details the complete technology stack used to build the platform. This document is designed for technical reviews, hackathon judges, and onboarding new developers.

---

## 1. Complete Technology Stack

### Frontend (Client-Side)
* **Framework:** Next.js 15 (App Router)
* **UI Library:** React 19
* **Styling:** Tailwind CSS (Utility-first CSS)
* **Animations:** Framer Motion (for fluid page transitions and interactive elements)
* **Icons:** Lucide-React
* **Maps Integration:** React-Leaflet (for interactive Civic Issue mapping)
* **PWA & Offline:** Custom Service Workers & `next-pwa` (for offline caching and rural accessibility)

### Backend (Server-Side)
* **API Architecture:** Next.js Route Handlers (`src/app/api/...`)
* **Real-Time Data:** Server-Sent Events (SSE) for streaming AI responses
* **Authentication:** NextAuth.js v4 (supporting Email OTP, Google OAuth, and GitHub OAuth)
* **Database ORM:** Prisma Client
* **Database:** SQLite (Used for local development and hackathon prototyping; easily swappable to PostgreSQL)

### AI & Machine Learning Infrastructure
* **Foundational Models:** 
  * Meta LLaMA 3.3 (70B & 8B variants)
  * Google Gemma 2 (9B)
  * Google Gemini 2.0 Flash
* **Inference Engine:** Groq (for ultra-fast, low-latency LLM inference)
* **Fallback Strategy:** Custom multi-model failover logic to prevent rate-limit crashes.
* **Architecture:** ReAct (Reasoning and Acting) Agentic Framework

---

## 2. Feature-to-Technology Mapping & Working Logic

### Feature A: The "City Council" Multi-Agent Debate (Agentic AI)
**What it does:** Two distinct AI personas autonomously debate a reported civic issue to reach a compromised, actionable resolution.
**Tech Stack Used:** Next.js SSE, Groq (LLaMA 3.3), Prompt Engineering, React 19 Client Components.

**How the Logic Works:**
1. **Context Injection:** When triggered, the backend fetches the Civic Issue data (Title, Location, Votes) via Prisma and injects it into two distinct system prompts: The *Budget Director* (fiscally conservative) and the *Citizen Advocate* (passionately pushing for immediate fixes).
2. **Independent Memory:** The backend maintains two separate `messages[]` arrays. The agents do not share a "brain". 
3. **The Debate Loop:** The system runs a 3-round loop. 
   - Agent A (Budget Director) generates an argument via `callAI()`.
   - The argument is streamed to the frontend via Server-Sent Events (SSE) for real-time visualization.
   - Agent A's output is injected into Agent B's conversation history as a User prompt.
   - Agent B counters, and the loop continues.
4. **Resolution Synthesis:** A third neutral "Moderator" AI reads the entire transcript and outputs a strict 3-bullet resolution with deterministic budget allocations (in ₹) and timelines.
5. **Persistence:** The final resolution is stored in the SQLite database under `CivicIssue.councilResolution`.

### Feature B: The AI Vendor Negotiator
**What it does:** Automates the procurement process for NGOs by autonomously finding vendors, getting quotes, and negotiating prices based on a budget.
**Tech Stack Used:** ReAct Framework, Next.js SSE, Deterministic Math Logic, Groq.

**How the Logic Works:**
1. **The ReAct Loop:** The AI operates in a continuous loop of `THOUGHT -> ACTION -> ACTION_INPUT -> OBSERVATION`.
2. **Tool Use:** The AI is given 4 tools (`search_real_vendors`, `get_vendor_quote`, `negotiate_price`, `generate_contract`).
3. **The Rate-Limit Breakthrough (Optimization):** Initially, every tool made an LLM call, crushing our API limits. We optimized this by restricting the LLM to only power the "Agent Brain". The actual negotiation tools (`quote` and `negotiate`) were rewritten using pure deterministic math. 
   - The system calculates a strict "cost floor" (65% of base price).
   - If the AI counter-offers below 65%, the tool mathematically rejects it.
4. **JSON Parsing Resilience:** LLMs frequently output malformed JSON. We built a custom `extractFirstJSON` algorithm that scans characters and counts nested braces `{ }` to extract perfect JSON objects, preventing `JSON.parse()` crashes.

### Feature C: Interactive Civic Issue Mapping
**What it does:** Allows citizens to drop pins on a map to report issues, upvote them, and track SLA (Service Level Agreement) deadlines.
**Tech Stack Used:** React-Leaflet, Tailwind CSS, Prisma.

**How the Logic Works:**
1. Users click on a dynamic map component (lazy-loaded via `next/dynamic` to prevent SSR window errors).
2. The coordinates (`lat`, `lng`) are saved to the SQLite database.
3. The UI dynamically calculates if an issue has breached its `slaDeadline` using standard Javascript Date comparisons and flags it as "ESCALATED" if necessary.

### Feature D: Progressive Web App (PWA) & Offline Mode
**What it does:** Allows the app to load even on terrible 2G/3G connections in rural areas.
**Tech Stack Used:** Next-PWA, Service Workers (`public/sw.js`).

**How the Logic Works & The Hydration Crash Fix:**
1. The Service Worker caches essential HTML and CSS on the first visit.
2. **The Challenge:** Next.js relies heavily on React Hydration. The Service Worker was caching *old* Javascript bundles. When the server sent new HTML, the old cached JS tried to attach to it, causing a catastrophic React Hydration crash.
3. **The Fix:** We engineered a "self-destructing" Service Worker update mechanism. We intercepted the `activate` event in the Service Worker lifecycle to explicitly wipe `caches.keys()` and call `self.skipWaiting()`, forcing the browser to fetch the fresh Next.js 15 bundles.

### Feature E: Secure Authentication & Role Management
**What it does:** Handles secure logins and protects sensitive dashboard routes.
**Tech Stack Used:** NextAuth.js v4.

**How the Logic Works:**
1. **Component Boundaries:** Next.js App Router enforces strict boundaries between Server and Client components. Initially, using `getServerSession()` inside a layout marked with `'use client'` caused massive runtime crashes.
2. **The Fix:** We refactored the component tree, pushing interactivity (like the Sidebar) down to child Client Components wrapped in a `<SessionProvider>`, allowing the core Layouts to remain pure Server Components for maximum security and SSR performance.

---

## 3. Summary of Innovations

1. **Multi-Model Fallback Chain:** Concord never goes down. If Groq's LLaMA 70B fails, it degrades to 8B, then to Gemma, then fails over to Google Gemini.
2. **Hybrid Deterministic AI:** By mixing LLM reasoning with hardcoded mathematical boundaries (like the 65% cost floor), we achieved "AI Safety" — ensuring the AI cannot hallucinate terrible financial deals.
3. **Real-Time Streaming UX:** We avoided the "spinning loading wheel" completely. Every AI action is streamed live to the user via SSE, creating a highly engaging, transparent experience.
