# SocialBridge AI

SocialBridge AI is an intelligent platform designed to connect NGOs, government bodies, local communities, and verified vendors. It streamlines collaboration, discovers high-potential partnerships using AI, and facilitates seamless execution of social impact projects.

## Features
- **AI Partnership Engine**: Uses AI (Groq/Gemini) to automatically analyze organizations and recommend the perfect matches for your project based on success rate, location, and domain expertise.
- **AI Creator Outreach**: Connect directly with project creators. The AI will draft highly personalized pitches for general partnerships, venue requests, funding, or volunteers based on the context of their post.
- **Civic Issue Tracking**: Interactive maps to track and report civic issues in local communities.
- **Intelligent Collaboration Dashboard**: Manage all your active partnerships, documents, tasks, and communications in one place.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & generic UI components
- **Database**: Prisma ORM with SQLite (pre-seeded with dummy data for local testing)
- **AI Integration**: Groq (Llama 3) & Google Gemini APIs

---

## Local Development Setup

To run this project locally or load it into Claude/Cursor for further development, follow these steps:

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` is required due to a conflict between Next.js 15 / React 19 and react-leaflet).*

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in the required API keys:
- **`GROQ_API_KEY`**: Highly recommended. Get a free API key at [console.groq.com](https://console.groq.com/keys).
- **`GEMINI_API_KEY`**: Used as a fallback. Get a free API key at [aistudio.google.com](https://aistudio.google.com/).
- **`NEXTAUTH_SECRET`**: A random string for securing authentication sessions (you can generate one with `openssl rand -base64 32`).
- **`NEXTAUTH_URL`**: `http://localhost:3000`
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`**: (Optional) For Google OAuth login.
- **`GITHUB_ID` / `GITHUB_SECRET`**: (Optional) For GitHub OAuth login.

### 3. Database Setup
The repository comes with a pre-seeded SQLite database (`prisma/dev.db`) so you can start right away without setting up Postgres. 

To ensure your Prisma client is generated, run:
```bash
npx prisma generate
```

*(Optional) If you ever need to reset the database, you can run:*
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### 4. Run the Development Server
Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Project Structure
- `src/app/` - Next.js App Router pages (Dashboard, Collaborate, Discover, Civic Issues, etc.)
- `src/app/api/` - Backend API routes (AI endpoints, Prisma database access, etc.)
- `src/components/` - Reusable UI components and page layouts
- `src/services/` - Core business logic (e.g., the `partnershipEngine.ts` that powers AI recommendations)
- `src/lib/` - Utilities for Prisma and AI model initialization
- `prisma/` - Database schema, seed script, and local SQLite DB

## Claude / AI Assistant Setup
If you are passing this repository to Claude, Cursor, or another AI coding assistant:
1. Provide the AI with this `README.md` to establish context.
2. The AI can find the core database schema in `prisma/schema.prisma`.
3. The main AI capabilities (Search, Email Drafting, Recommendations) are located in `src/app/api/ai/` and `src/services/partnershipEngine.ts`.
