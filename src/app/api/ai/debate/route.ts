import { NextRequest } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

// ── AI Call Helper (reused from negotiate route) ────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function callAI(messages: any[], temperature = 0.7, maxTokens = 1500): Promise<string> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

  if (process.env.GROQ_API_KEY) {
    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.choices[0].message.content;
        }
        const errText = await res.text();
        console.error(`Groq ${model} failed (${res.status}):`, errText.slice(0, 200));
        if (res.status === 429) {
          await delay(1500);
          continue;
        }
      } catch (e) {
        console.error(`Groq ${model} error:`, e);
      }
    }
  }

  // Fallback to Gemini
  try {
    const { getFlashModel } = await import('@/backend/lib/gemini');
    const model = getFlashModel();
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n');
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (geminiError: any) {
    throw new Error('All AI providers are rate-limited. Please wait a minute and try again.');
  }
}

// ── Agent Personas ──────────────────────────────────────────────────

const BUDGET_DIRECTOR_PROMPT = `You are the BUDGET DIRECTOR of a municipal corporation in India. Your primary goal is fiscal responsibility. You always look for the most cost-effective solution. You are skeptical of expensive proposals and suggest phased rollouts, cheaper alternatives, and reusing existing infrastructure. You care about taxpayer money.

RULES:
- Keep your responses to 2-3 short paragraphs max.
- Be specific with numbers and cost estimates in INR (₹).
- Address the other agent's points directly.
- Use a professional but firm tone.
- Do NOT repeat yourself from previous rounds.`;

const CITIZEN_ADVOCATE_PROMPT = `You are the CITIZEN ADVOCATE, a passionate representative of the people affected by this civic issue. Your primary goal is rapid resolution and citizen safety. You push for immediate action, argue for quality solutions, and highlight the human impact of delays. You are emotional but logical.

RULES:
- Keep your responses to 2-3 short paragraphs max.
- Cite real human impact (health risks, economic losses, safety hazards).
- Address the other agent's points directly.
- Use a passionate but respectful tone.
- Do NOT repeat yourself from previous rounds.`;

const RESOLUTION_PROMPT = `You are a neutral City Council Moderator. You have just witnessed a debate between the Budget Director and the Citizen Advocate about a civic issue. Based on their arguments, synthesize a FINAL RESOLUTION that balances fiscal responsibility with citizen welfare.

RULES:
- Output ONLY the resolution text, nothing else.
- Keep it to 3-4 bullet points.
- Each bullet should start with an action verb (e.g., "Deploy...", "Allocate...", "Establish...").
- Include specific budget allocations in INR (₹).
- Include a timeline for each action.
- Be practical and actionable.`;

// ── Main Debate Endpoint ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { issueId } = body;

  if (!issueId) {
    return new Response(JSON.stringify({ error: 'Missing issueId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const issue = await prisma.civicIssue.findUnique({
    where: { id: issueId },
    include: { reporter: true },
  });

  if (!issue) {
    return new Response(JSON.stringify({ error: 'Issue not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const issueContext = `
CIVIC ISSUE: ${issue.title}
DESCRIPTION: ${issue.description}
CATEGORY: ${issue.category}
LOCATION: ${issue.address}, ${issue.city}
PRIORITY: ${issue.priority}
STATUS: ${issue.status}
CITIZENS AFFECTED (votes): ${issue.voteCount}
REPORTED BY: ${issue.reporter?.name || 'Anonymous Citizen'}
`;

        // Initialize conversation histories for both agents
        const budgetMessages: any[] = [
          { role: 'system', content: BUDGET_DIRECTOR_PROMPT },
          { role: 'user', content: `A civic issue has been raised:\n${issueContext}\n\nAs the Budget Director, present your initial assessment and proposed approach to handling this issue. Focus on cost-effective solutions.` },
        ];

        const advocateMessages: any[] = [
          { role: 'system', content: CITIZEN_ADVOCATE_PROMPT },
        ];

        send({ type: 'SYSTEM', content: `⚡ City Council simulation started for: "${issue.title}"` });
        send({ type: 'SYSTEM', content: `📋 Issue Category: ${issue.category} | Priority: ${issue.priority} | ${issue.voteCount} citizens affected` });

        const DEBATE_ROUNDS = 3;
        const debateHistory: { agent: string; content: string }[] = [];

        for (let round = 1; round <= DEBATE_ROUNDS; round++) {
          send({ type: 'ROUND', round, total: DEBATE_ROUNDS });

          // ── Budget Director's turn ──
          await delay(800);
          send({ type: 'AGENT_START', agent: 'budget_director', round });

          const budgetResponse = await callAI(budgetMessages, 0.6, 800);
          debateHistory.push({ agent: 'Budget Director', content: budgetResponse });

          send({ type: 'AGENT_MESSAGE', agent: 'budget_director', content: budgetResponse, round });

          // Feed Budget Director's response to Citizen Advocate
          if (round === 1) {
            advocateMessages.push({
              role: 'user',
              content: `A civic issue has been raised:\n${issueContext}\n\nThe Budget Director just said:\n"${budgetResponse}"\n\nAs the Citizen Advocate, counter their position. Argue for why immediate, quality action is needed. Address their specific points.`,
            });
          } else {
            advocateMessages.push({
              role: 'user',
              content: `The Budget Director responds in Round ${round}:\n"${budgetResponse}"\n\nCounter their arguments. This is round ${round} of ${DEBATE_ROUNDS}${round === DEBATE_ROUNDS ? '. This is the FINAL round — make your strongest closing argument and suggest a compromise.' : '.'}`,
            });
          }

          // ── Citizen Advocate's turn ──
          await delay(1200);
          send({ type: 'AGENT_START', agent: 'citizen_advocate', round });

          const advocateResponse = await callAI(advocateMessages, 0.7, 800);
          debateHistory.push({ agent: 'Citizen Advocate', content: advocateResponse });

          send({ type: 'AGENT_MESSAGE', agent: 'citizen_advocate', content: advocateResponse, round });

          // Feed Advocate's response back to Budget Director for next round
          budgetMessages.push({ role: 'assistant', content: budgetResponse });
          budgetMessages.push({
            role: 'user',
            content: `The Citizen Advocate responds:\n"${advocateResponse}"\n\nCounter their arguments. This is round ${round + 1} of ${DEBATE_ROUNDS}${round + 1 > DEBATE_ROUNDS ? '. This is the FINAL round — make your strongest closing argument and suggest a compromise.' : '.'}`,
          });

          // Also keep advocate's history coherent
          advocateMessages.push({ role: 'assistant', content: advocateResponse });
        }

        // ── Generate Final Resolution ──
        await delay(1000);
        send({ type: 'RESOLUTION_START' });

        const debateTranscript = debateHistory
          .map((entry) => `[${entry.agent}]: ${entry.content}`)
          .join('\n\n');

        const resolutionMessages = [
          { role: 'system', content: RESOLUTION_PROMPT },
          {
            role: 'user',
            content: `Issue: ${issue.title}\nCategory: ${issue.category}\nLocation: ${issue.address}, ${issue.city}\n\nDebate Transcript:\n${debateTranscript}\n\nSynthesize the final resolution.`,
          },
        ];

        const resolution = await callAI(resolutionMessages, 0.4, 1000);

        // Save to database
        await prisma.civicIssue.update({
          where: { id: issueId },
          data: { councilResolution: resolution },
        });

        send({ type: 'RESOLUTION', content: resolution });
        send({ type: 'COMPLETE' });
      } catch (error: any) {
        console.error('Debate error:', error);
        send({ type: 'ERROR', error: error.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
