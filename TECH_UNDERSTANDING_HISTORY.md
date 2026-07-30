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
