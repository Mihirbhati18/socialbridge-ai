# Concord: Master Tech Architecture & Logic Documentation

> **Purpose:** This document is the exhaustive technical blueprint of the Concord platform. It breaks down the internal logic, mathematical algorithms, AI prompt engineering, and failover architectures for every single feature in the project.

---

## 1. Feature Deep Dives: The AI & Logic Layer

### A. The "City Council" Multi-Agent Debate (Agentic AI)
**Concept:** Instead of a single chatbot, we spawn two independent AI personas with opposing goals to debate a civic issue and reach a compromise.

**Technical Implementation:**
- **Context Injection:** When a user clicks "Start Debate", the frontend sends the `issueId` to `api/ai/debate/route.ts`. The backend fetches the issue (title, description, location, votes) from the SQLite database (Prisma) and injects it into the system prompts.
- **Persona Engineering:** 
  - *The Budget Director* is strictly prompted to minimize costs and protect taxpayers.
  - *The Citizen Advocate* is prompted to push for immediate, high-quality fixes regardless of cost.
- **Isolated Memory Architecture:** We maintain two separate arrays: `budgetMessages[]` and `advocateMessages[]`. Agent A's output is pushed as a `user` message into Agent B's array. This prevents the models from confusing their personas.
- **The Debate Loop:** Runs exactly for 3 rounds.
- **Resolution Synthesis:** A third AI (Moderator) reads the full transcript. We use strict prompt engineering (`Return ONLY a JSON with specific INR budget and timelines`) to force a deterministic resolution, preventing hallucinations.
- **Streaming:** Uses Server-Sent Events (SSE) via Next.js `ReadableStream` to stream the debate character-by-character to the frontend, preventing Vercel/Next.js API timeout limits.

### B. The AI Vendor Negotiator
**Concept:** An autonomous agent that takes a budget, finds vendors, and negotiates procurement contracts.

**Technical Implementation:**
- **ReAct Framework:** Operates in a `THOUGHT -> ACTION -> ACTION_INPUT -> OBSERVATION` loop.
- **The Rate-Limit Optimization (Hybrid Deterministic AI):**
  - Initially, every tool (search, quote, negotiate) made an LLM call. This caused 429 Rate Limit crashes.
  - **The Fix:** The LLM only powers the "Brain" and `search` tool. The `quote` and `negotiate` tools are pure math functions. 
  - **Mathematical Guardrails:** The `negotiate_price` tool calculates a strict `costFloor` (65% of the vendor's base price). If the AI tries to offer 64%, the math algorithm rejects it. This guarantees AI safety and prevents the LLM from making financially ruinous deals.
- **The JSON Parsing Fix:** LLMs often output garbage text before/after JSON (e.g., "Here is the JSON: {}"). Standard `JSON.parse()` crashed. We wrote `extractFirstJSON`, a custom bracket-counting algorithm that scans characters to perfectly extract nested `{}` objects, ensuring 100% stable tool execution.

### C. The AI Partnership Engine (`partnershipEngine.ts`)
**Concept:** An algorithmic engine that matches an NGO/Initiative with the perfect corporate or civic partners.

**Technical Implementation:**
- **The Weighting Algorithm:** 
  - `historyScore` (15%): Normalizes past successful collaborations (0-20 scale).
  - `successScore` (20%): Win-rate of past events.
  - `ratingScore` (15%): Out of 5 stars.
  - `distanceScore` (10%): Uses the **Haversine Formula** (`R * c`) to calculate the exact geographical distance between the initiative's `lat/lng` and the partner's `lat/lng`.
  - `categoryScore` (15%): A custom slug-matching algorithm to see if the partner's domain aligns with the issue (e.g., "Environment" matches "Tree Planting").
- **AI Explanation Generation:** After the top 10 matches are found via math, we pass the candidates to the LLM with the prompt: *"Write a compelling 2-sentence explanation of why they are a great match..."*. This gives users a human-readable justification for the mathematical match.

### D. AI Creator Outreach & Email Generation (`generate-email/route.ts`)
**Concept:** Automatically drafts tailored emails to invite partners to collaborate.

**Technical Implementation:**
- **Context Parsing:** Extracts the `recipientOrg`, `projectContext`, and `tone` from the frontend payload.
- **Strict Formatting:** The prompt forces the LLM to output exactly `SUBJECT: [Text] \n BODY: [Text]`. 
- **Regex Extraction:** We use a regex `match(/SUBJECT:\s*(.*?)\s*BODY:\s*([\s\S]*)/i)` to parse the output and render it beautifully in the UI.
- **Multi-Model Fallback Engine:** 
  - Primary: `llama-3.3-70b` (via Groq for 800 tokens/sec speed).
  - Secondary: If Groq hits a rate limit, the `catch` block automatically fails over to Google's `gemini-1.5-pro`.
  - Tertiary: If no API keys exist (e.g., for local hackathon testing), it falls back to a hardcoded string template to ensure the demo never crashes.

### E. Civic Issue Map & SLA Tracking
**Concept:** Interactive mapping and deadline tracking for reported issues.

**Technical Implementation:**
- **React-Leaflet:** Used for the map. Since Leaflet requires the `window` object, it crashes Next.js SSR. We solved this by using `next/dynamic` with `ssr: false`.
- **SLA Cron Jobs (`api/cron/check-sla`):** A backend scheduled job that compares the current timestamp against the `slaDeadline`. If breached, it updates the status to `ESCALATED`.

---

## 2. Global Architecture & Stack

### Frontend
- **Framework:** Next.js 15 (App Router). We strictly separate Server Components (for data fetching and SEO) from Client Components (`'use client'` for state and hooks).
- **Styling:** Tailwind CSS + Framer Motion.
- **PWA (Progressive Web App):** Uses a custom Service Worker (`public/sw.js`). 
  - **The Hydration Crash Fix:** We intercepted the Service Worker's `activate` event to explicitly wipe `caches.keys()`. This prevents the Service Worker from serving stale Javascript bundles that caused catastrophic React hydration mismatches when new code was deployed.

### Backend & Database
- **Auth:** NextAuth.js v4 (Email OTP, Google, Github). Session data is passed down via a `<SessionProvider>` wrapped only around client nodes (like the Sidebar), keeping Layouts secure and SSR-rendered.
- **Database:** Prisma ORM connected to SQLite (for rapid local dev).
- **Hosting Considerations:** Vercel (Frontend & Serverless functions).

---
## Summary of Engineering Philosophy
Concord is built on **Defensive AI Architecture**. We never trust the LLM fully. Whether it's mathematical floors for negotiation, regex bracket-counting for JSON, or multi-model API failovers, every AI interaction is wrapped in deterministic code to ensure 100% uptime and safety.
