# SocialBridge AI: Tech, Understanding, and History

> **Purpose:** This document tracks the complete history of features we built, the technical logic behind them, the challenges we faced, and how we solved them. Use this to easily explain the engineering journey to hackathon judges.

---

## Part 1: Mihir's Work — AI Vendor Negotiator

### 1. What We Did
We transformed a static placeholder page into a fully functional **Autonomous Agentic AI**. Instead of a simple chatbot where a user asks a question and gets an answer, we built an AI agent that takes a user's requirement (e.g., "I need 500 chairs for an NGO event") and budget, and autonomously negotiates with local vendors to get the best deal.

### 2. How We Did It (The Architecture)
We used the **ReAct (Reasoning and Acting)** framework. 
The AI operates in a continuous loop:
- **THOUGHT:** The AI analyzes the budget and decides its strategy.
- **ACTION:** The AI calls a specific tool (function).
- **ACTION_INPUT:** The AI passes parameters (like vendor name, proposed price) to the tool.
- **OBSERVATION:** The backend executes the tool and feeds the result back to the AI.

To make the UI feel fast and "hacker-like", we didn't want the user waiting 30 seconds for a response. We implemented **Server-Sent Events (SSE)**. Every time the AI has a "thought" or makes a "tool call", the Next.js backend immediately streams that data to the frontend in real-time, creating a live terminal effect.

### 3. The Technical Process & Tools Built
We gave the AI a suite of 4 tools to use autonomously:
1. **`search_real_vendors`**: Uses the AI's internal knowledge (simulating Google Maps) to search the user's specific city and return real, plausible business names, ratings, and estimated unit prices.
2. **`get_vendor_quote`**: Takes the vendor data and calculates a realistic initial quote, applying an automatic 5-15% "social cause" discount.
3. **`negotiate_price`**: Processes counter-offers from the AI. It calculates the vendor's absolute "cost floor" (65% of the base price). If the AI's offer is above the floor, it counters or accepts. If it's too low, it rejects.
4. **`generate_contract`**: Finalizes the deal and generates a reference ID.

### 4. Issues Faced & How We Overcame Them

During development, we hit two major, application-breaking bugs. Here is how we solved them:

#### Issue #1: JSON Parsing Crashes
**The Problem:** The AI's job was to output a JSON string to trigger a tool (e.g., `{"vendor_name": "ABC"}`). However, LLMs are unpredictable. Sometimes they would output the JSON perfectly, but other times they would add conversational text like `"Here is the JSON: { ... }"` or trailing characters. When our code ran `JSON.parse()`, it crashed with a `SyntaxError: Unexpected non-whitespace character after JSON`.
**The Solution:** We couldn't rely on standard Regex because nested curly braces `{ }` would break it. So, we wrote a custom **balanced-brace extraction function** (`extractFirstJSON`). This algorithm scans the AI's output character by character, counts the opening and closing brackets, and extracts *only* the perfect JSON object, ignoring any garbage text before or after it.

#### Issue #2: API Rate Limits Crushing the App
**The Problem:** Initially, every single tool (`search`, `quote`, `negotiate`) made its own separate API call to Groq to generate a response. Because the ReAct loop runs multiple times, a single negotiation was making 8-10 massive AI calls in a span of 5 seconds. Groq immediately rate-limited us with a `429 Too Many Requests` error, and the app completely died.
**The Solution (Our Biggest Optimization):** We implemented a two-part architectural fix:
1. **Smart Senses, Math Logic:** We completely rewrote the tools. We restricted the LLM to only power the main "Agent Brain" and the initial `search` tool. The `quote` and `negotiate` tools were rebuilt using **pure deterministic math** (calculating margins, markups, and cost floors). This instantly eliminated 60% of our API calls without sacrificing negotiation quality.
2. **Multi-Model Fallback Chain:** If Groq's primary model (`llama-3.3-70b`) still hit a rate limit, the app used to just crash. We wrapped the API call in a `try/catch` chain. Now, if the massive model fails, it automatically degrades to a faster model (`llama-3.1-8b`), then to `gemma2-9b`, and finally to Google's `Gemini 2.0 Flash`. 
3. **Throttling:** We added an 800ms `setTimeout` delay between agent loops to let the API breathe.

**Result:** The agent is now practically uncrashable and costs a fraction of the compute power to run.

---

## Part 2: Harsh's Work — Offline PWA & Service Workers

### 1. What We Did
Harsh focused on bringing **Progressive Web App (PWA) and offline capabilities** to the platform. By introducing a custom Service Worker, the goal was to cache essential files, CSS, and routes so that users with poor internet connections (e.g., in rural areas) could still view the app's core UI without the dinosaur screen.

### 2. The Technical Challenge: The Next.js Hydration Crash
**The Problem:** While the Service Worker successfully cached files, it caused a catastrophic issue with Next.js 15. Next.js relies heavily on "Hydration"—where the server sends a skeleton HTML, and the client injects React logic into it. The Service Worker was aggressively intercepting network requests and serving stale, outdated cached JavaScript bundles from before code merges. 
Because the old Javascript didn't match the new HTML structure generated by the server, React completely panicked. Hydration crashed, `useEffect` hooks stopped running, and the front page permanently froze on a broken splash screen.

**The Solution:** Debugging this was complex. We wrote a headless Puppeteer script to scrape the client-side console errors since the server logs showed a perfect `200 OK`. Once we identified the rogue `public/sw.js` cache as the culprit, we engineered a "self-destructing" Service Worker. Instead of just deleting the file (which wouldn't remove it from users' browsers), we replaced the logic with an `activate` event listener that explicitly wiped all caches (`caches.keys().then(map => caches.delete)`) and called `unregister()`. This instantly repaired the hydration process.

---

## Part 3: Sarthak's Work — Architecture, UI, & Authentication

### 1. What We Did
Sarthak architected the core layouts, dashboards, and the component design system. This included building out the Next.js App Router structure (`/dashboard`, `/profile`, `/collaborate`) and creating the highly interactive layout skeleton with `framer-motion` and Tailwind CSS. 

### 2. The Technical Challenge: Component Boundaries & NextAuth Integration
**The Problem:** During the initial UI build, Sarthak used hardcoded mock data (e.g., "Dr. Priya") to visualize the design. When we transitioned to a real production environment with **NextAuth**, we had to dynamically fetch the logged-in user's data. 
However, Next.js App Router has very strict boundaries between **Server Components** and **Client Components**. When we tried to fetch the session using `getServerSession()` on the Dashboard, Next.js threw a massive runtime error. Why? Because the layout previously had a `'use client'` directive at the top, and importing Node.js backend functions into a client file violates the React 19 architecture.

**The Solution:** We meticulously refactored the component tree. We identified components that didn't actually need client-side hooks (like `useState`) and stripped the `'use client'` directives from them, converting them into pure Server Components. For components that *did* need interactivity (like the Sidebar), we used the client-side `useSession` hook from NextAuth and wrapped the entire application in a `<SessionProvider>`. 
This allowed us to achieve dynamic, authenticated data fetching without sacrificing the security or performance of SSR (Server-Side Rendering).

---

## Part 4: Mihir's Work — City Council Multi-Agent Debate (Agentic AI)

### 1. What We Did
We built a **Multi-Agent AI System** where two distinct AI personas autonomously debate each other over a civic issue. This is not a chatbot — it's two independent agents with opposing goals that argue, counter each other's points, and ultimately reach a compromised resolution. This is the most technically advanced "Agentic" feature in the entire project.

When a citizen views a civic issue (e.g., "Massive Pothole on MG Road"), they can trigger a **"City Council Simulation"**. Two AI agents are spawned:
- 🛡️ **The Budget Director** — A fiscally conservative municipal officer. Their goal is to minimize cost, propose phased rollouts, and protect taxpayer money.
- 🧡 **The Citizen Advocate** — A passionate people's representative. Their goal is rapid action, quality solutions, and highlighting human impact (safety hazards, health risks, economic losses).

They debate for **3 rounds**, directly addressing each other's arguments. After the debate, a neutral **Moderator AI** reads the full transcript and synthesizes a balanced **Final Resolution** with specific budget allocations and timelines.

### 2. How It Works (The Architecture)

The system uses **Server-Sent Events (SSE)** for real-time streaming, similar to the vendor negotiation agent. Here's the internal flow:

**Step 1: Context Injection**
When the user clicks "Start Debate", the frontend sends the `issueId` to the backend. The backend fetches the full civic issue data (title, description, category, location, priority, vote count) from the database and injects it into both agents' system prompts as context.

**Step 2: Independent Conversation Histories**
Each agent maintains its **own separate conversation history** (`budgetMessages[]` and `advocateMessages[]`). This is critical — if they shared a single history, the AI would blur the personalities. By keeping them isolated, each agent "remembers" only what it said and what the other agent said to it, creating genuinely independent reasoning.

**Step 3: The Debate Loop (3 Rounds)**
```
For each round (1 to 3):
  1. Budget Director receives the issue context (round 1) or the Advocate's last argument.
  2. Budget Director generates its argument via callAI().
  3. The argument is streamed to the frontend in real-time via SSE.
  4. Budget Director's argument is injected into the Advocate's conversation history.
  5. Citizen Advocate generates its counter-argument via callAI().
  6. The counter-argument is streamed to the frontend.
  7. Advocate's argument is injected back into Budget Director's history for the next round.
```

In the final round, both agents are prompted to "make your strongest closing argument and suggest a compromise", which steers the debate toward convergence.

**Step 4: Resolution Synthesis**
After all 3 rounds, a third AI call is made with a **Moderator** system prompt. The moderator receives the full debate transcript and outputs a structured resolution with:
- Specific action items (e.g., "Deploy emergency patching crew within 48 hours")
- Budget allocations in INR (e.g., "Allocate ₹2,50,000 for permanent road resurfacing")
- Timelines for each action

**Step 5: Persistence**
The final resolution is saved to the database (`CivicIssue.councilResolution`). If a user revisits the issue page, the resolution is displayed instantly without re-running the debate.

### 3. The Frontend Experience
The UI is a chat-style interface with:
- **Color-coded messages** — Blue bubbles for Budget Director, Orange bubbles for Citizen Advocate.
- **Animated typing indicators** — Bouncing dots appear while an agent is "thinking", making it feel like a live conversation.
- **Round indicators** — Each message shows which debate round it belongs to (R1, R2, R3).
- **Final Resolution Card** — An emerald-green styled card that displays the synthesized action plan.

### 4. Why This Is Technically Impressive
- **True Multi-Agent Architecture:** Two independent AI instances with separate memory, separate system prompts, and opposing objectives.
- **Cross-Agent Communication:** Agent A's output becomes Agent B's input, and vice versa, creating a genuine feedback loop.
- **Convergence Design:** The prompt engineering deliberately steers the agents toward compromise in the final round, mimicking real democratic debate.
- **Real-Time Streaming:** All 6 debate messages + the resolution are streamed live via SSE, not batched. The user watches the debate unfold in real-time.
- **Zero Hallucination on Numbers:** The Moderator is constrained to output specific ₹ amounts and timelines, grounding the resolution in actionable data.
