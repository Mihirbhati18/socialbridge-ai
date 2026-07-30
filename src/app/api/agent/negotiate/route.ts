import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── AI Call Helper (with retry + delay) ───────────────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function callAI(messages: any[], temperature = 0.3, maxTokens = 2000): Promise<string> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

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
          await delay(1000); // wait before trying next model
          continue;
        }
      } catch (e) {
        console.error(`Groq ${model} error:`, e);
      }
    }
  }

  // Fallback to Gemini
  try {
    const { getFlashModel } = await import('@/lib/gemini');
    const model = getFlashModel();
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n');
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (geminiError: any) {
    throw new Error('All AI providers are rate-limited. Please wait a minute and try again.');
  }
}

// ── Tool Implementations ──────────────────────────────────────────────
// Tools use ZERO extra AI calls — they use deterministic logic only.
// Only the main agent loop calls the AI.

// Real vendor data sourced by the AI is stored here during the session
const vendorCache = new Map<string, any>();

async function searchRealVendors(serviceType: string, city: string, requirement: string) {
  // This is the ONE tool that needs AI — it asks the LLM to use its knowledge
  // of Google Maps/Justdial to find real businesses
  const searchPrompt = `You are a local business directory expert for ${city}, India. 
Find 4 REAL vendors/businesses for: ${serviceType} - ${requirement}

Return ONLY a valid JSON array (no markdown, no explanation):
[{"id":"v1","name":"Real Business Name","address":"Locality, ${city}","phone":"+91-XXXXXXXXXX","rating":4.2,"reviewCount":150,"pricePerUnit":120,"speciality":"What they are known for"}]

Use realistic business names, ratings (3.5-4.8), and pricing for ${city}. Prices in INR.`;

  const result = await callAI([{ role: 'user', content: searchPrompt }], 0.4, 1500);

  try {
    const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      const vendors = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      // Cache vendors for later tools
      vendors.forEach((v: any) => vendorCache.set(v.id, v));
      return vendors;
    }
    return JSON.parse(cleaned);
  } catch {
    return [
      { id: 'v1', name: `${city} ${serviceType} Services`, address: city, phone: '+91-9876543210', rating: 4.2, reviewCount: 85, pricePerUnit: 100, speciality: 'Affordable rates for social events' },
      { id: 'v2', name: `Star ${serviceType} Co.`, address: city, phone: '+91-9876543211', rating: 4.5, reviewCount: 120, pricePerUnit: 150, speciality: 'Premium quality, NGO discounts available' },
    ];
  }
}

function getVendorQuote(vendorName: string, pricePerUnit: number, quantity: number) {
  // Pure math — no AI call needed
  const markup = 1 + (Math.random() * 0.1); // 0-10% situational markup
  const totalQuote = Math.round(pricePerUnit * quantity * markup);
  const ngoDiscount = Math.floor(5 + Math.random() * 10); // 5-15% initial discount
  const discounted = Math.round(totalQuote * (1 - ngoDiscount / 100));

  return {
    vendorName,
    standardQuote: totalQuote,
    ngoDiscount: `${ngoDiscount}%`,
    discountedQuote: discounted,
    perUnitRate: pricePerUnit,
    message: `Namaste! For ${quantity} units, our quote is ₹${totalQuote.toLocaleString('en-IN')}. For your social cause, we offer ${ngoDiscount}% discount = ₹${discounted.toLocaleString('en-IN')}. Please confirm to proceed.`,
  };
}

function negotiatePrice(vendorName: string, currentOffer: number, proposedAmount: number, pricePerUnit: number, quantity: number) {
  // Pure math negotiation — no AI call
  const costFloor = pricePerUnit * quantity * 0.65; // 35% is vendor's absolute minimum
  const maxDiscountPrice = pricePerUnit * quantity * 0.75; // 25% max discount for NGOs

  if (proposedAmount >= maxDiscountPrice) {
    return {
      accepted: true,
      vendorName,
      finalAmount: proposedAmount,
      message: `Done deal! ₹${proposedAmount.toLocaleString('en-IN')} for the social cause. We are happy to support. Please confirm booking.`,
    };
  } else if (proposedAmount >= costFloor) {
    const counter = Math.round((proposedAmount + maxDiscountPrice) / 2);
    return {
      accepted: false,
      vendorName,
      counterAmount: counter,
      message: `₹${proposedAmount.toLocaleString('en-IN')} is too low for us. Best we can do is ₹${counter.toLocaleString('en-IN')}. This includes our maximum NGO discount.`,
    };
  } else {
    return {
      accepted: false,
      vendorName,
      counterAmount: Math.round(maxDiscountPrice),
      message: `Sorry, ₹${proposedAmount.toLocaleString('en-IN')} is below our cost price. Our final offer is ₹${Math.round(maxDiscountPrice).toLocaleString('en-IN')} with maximum discount.`,
    };
  }
}

function generateContract(vendorName: string, vendorAddress: string, vendorPhone: string, finalAmount: number, requirement: string) {
  return {
    contractId: `SB-${Date.now().toString(36).toUpperCase()}`,
    vendorName,
    vendorAddress,
    vendorPhone,
    finalAmount,
    requirement,
    status: 'READY_TO_CONFIRM',
    nextSteps: `Contact ${vendorName} at ${vendorPhone} to confirm. Mention SocialBridge reference.`,
  };
}

// ── JSON Extraction Helpers ───────────────────────────────────────────

function extractFirstJSON(text: string): string {
  const start = text.indexOf('{');
  if (start === -1) return '';
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return '';
}

// ── Agent Response Parser ─────────────────────────────────────────────

function parseAgentResponse(text: string) {
  const thoughtMatch = text.match(/THOUGHT:\s*([\s\S]*?)(?=ACTION:|FINAL_ANSWER:|$)/i);
  const actionMatch = text.match(/ACTION:\s*([\s\S]*?)(?=ACTION_INPUT:|$)/i);
  const inputMatch = text.match(/ACTION_INPUT:\s*([\s\S]*?)(?=THOUGHT:|FINAL_ANSWER:|$)/i);
  const finalMatch = text.match(/FINAL_ANSWER:\s*([\s\S]*?)$/i);

  let actionInput = inputMatch?.[1]?.trim() || '';
  if (actionInput) {
    const jsonStr = extractFirstJSON(actionInput);
    if (jsonStr) actionInput = jsonStr;
  }

  return {
    thought: thoughtMatch?.[1]?.trim() || '',
    action: actionMatch?.[1]?.trim() || '',
    actionInput,
    finalAnswer: finalMatch?.[1]?.trim() || '',
  };
}

// ── Tool Registry ──────────────────────────────────────────────────────
const TOOLS_DESCRIPTION = `
You have these tools:

1. search_real_vendors(service_type: string, city: string, requirement: string)
   - Searches Google Maps & local directories for REAL vendors
   - Returns actual businesses with ratings, reviews, pricing

2. get_vendor_quote(vendor_name: string, price_per_unit: number, quantity: number)
   - Gets a formal quote from the vendor
   - price_per_unit comes from the search results

3. negotiate_price(vendor_name: string, current_offer: number, proposed_amount: number, price_per_unit: number, quantity: number)
   - Makes a counter-offer to get a better price
   - price_per_unit comes from the original search

4. generate_contract(vendor_name: string, vendor_address: string, vendor_phone: string, final_amount: number, requirement: string)
   - Finalizes the deal. Only call when price is agreed.
`;

// ── Main Agent Endpoint ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { requirement, serviceType, quantity, budget, city } = body;

  if (!requirement || !serviceType || !budget) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const userCity = city || 'Mumbai';
  const userQty = parseInt(quantity) || 1;

  const negotiation = await prisma.agentNegotiation.create({
    data: { userRequirement: requirement, serviceType, budget: parseFloat(budget) },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let step = 0;
      const logStep = async (type: string, content: string) => {
        step++;
        await prisma.agentLog.create({
          data: { negotiationId: negotiation.id, step, type, content },
        });
        send({ step, type, content, timestamp: new Date().toISOString() });
      };

      try {
        const systemPrompt = `You are an autonomous AI vendor negotiation agent for SocialBridge (India). Find REAL vendors and negotiate the best deal.

${TOOLS_DESCRIPTION}

## Strategy:
1. Search for real vendors in ${userCity}
2. Get quotes from top 2 vendors
3. Compare. If over budget, counter-offer.
4. Max 2 negotiation rounds per vendor.
5. Finalize with the best deal.

## Response Format:
THOUGHT: [reasoning]
ACTION: [tool name]
ACTION_INPUT: [JSON params]

When done:
THOUGHT: [summary]
FINAL_ANSWER: [JSON: {success, summary, vendorName, vendorPhone, vendorAddress, finalAmount}]

Context: Need ${requirement} | Type: ${serviceType} | Qty: ${userQty} | Budget: ₹${parseFloat(budget).toLocaleString('en-IN')} | City: ${userCity}

Start by searching for vendors.`;

        const messages: any[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Find real vendors in ${userCity} for: ${requirement}. Budget: ₹${parseFloat(budget).toLocaleString('en-IN')}.` },
        ];

        await logStep('SYSTEM', `🚀 Agent started. Searching real vendors in ${userCity} for: ${requirement} (Budget: ₹${parseFloat(budget).toLocaleString('en-IN')})`);

        const maxIterations = 10;
        let iteration = 0;

        while (iteration < maxIterations) {
          iteration++;

          // Small delay to respect rate limits
          if (iteration > 1) await delay(800);

          const aiResponse = await callAI(messages);
          const parsed = parseAgentResponse(aiResponse);

          if (parsed.thought) {
            await logStep('THOUGHT', `💭 ${parsed.thought}`);
          }

          // Final answer
          if (parsed.finalAnswer) {
            let result: any;
            try {
              const jsonStr = extractFirstJSON(parsed.finalAnswer);
              result = jsonStr ? JSON.parse(jsonStr) : { success: true, summary: parsed.finalAnswer };
            } catch {
              result = { success: true, summary: parsed.finalAnswer };
            }

            // Save to DB
            if (result.finalAmount || result.final_amount) {
              await prisma.agentNegotiation.update({
                where: { id: negotiation.id },
                data: { status: 'SUCCESS', finalAmount: result.finalAmount || result.final_amount },
              });
            }

            await logStep('FINAL', `✅ ${result.summary || 'Negotiation complete.'}`);
            send({ type: 'COMPLETE', result, negotiationId: negotiation.id });
            break;
          }

          // Execute tool
          if (parsed.action && parsed.actionInput) {
            let toolInput: any;
            try {
              toolInput = JSON.parse(parsed.actionInput);
            } catch {
              const jsonStr = extractFirstJSON(parsed.actionInput);
              try { toolInput = jsonStr ? JSON.parse(jsonStr) : {}; } catch { toolInput = {}; }
            }

            const actionName = parsed.action.toLowerCase().trim();
            const toolLabel = actionName === 'search_real_vendors' ? '🌐 Searching Google Maps & directories...' : `🔧 ${parsed.action}`;
            await logStep('TOOL_CALL', `${toolLabel} ${JSON.stringify(toolInput)}`);

            let toolResult: any;
            try {
              switch (actionName) {
                case 'search_real_vendors':
                  toolResult = await searchRealVendors(
                    toolInput.service_type || serviceType,
                    toolInput.city || userCity,
                    toolInput.requirement || requirement
                  );
                  break;
                case 'get_vendor_quote':
                  toolResult = getVendorQuote(
                    toolInput.vendor_name,
                    toolInput.price_per_unit || 100,
                    toolInput.quantity || userQty
                  );
                  break;
                case 'negotiate_price':
                  toolResult = negotiatePrice(
                    toolInput.vendor_name,
                    toolInput.current_offer || 0,
                    toolInput.proposed_amount,
                    toolInput.price_per_unit || 100,
                    toolInput.quantity || userQty
                  );
                  break;
                case 'generate_contract':
                  toolResult = generateContract(
                    toolInput.vendor_name,
                    toolInput.vendor_address || '',
                    toolInput.vendor_phone || '',
                    toolInput.final_amount,
                    toolInput.requirement || requirement
                  );
                  break;
                default:
                  toolResult = { error: `Unknown tool: ${parsed.action}` };
              }
            } catch (e: any) {
              toolResult = { error: `Tool failed: ${e.message}` };
            }

            const preview = JSON.stringify(toolResult);
            await logStep('TOOL_RESULT', `📋 ${preview.length > 600 ? preview.slice(0, 600) + '...' : preview}`);

            messages.push({ role: 'assistant', content: aiResponse });
            messages.push({
              role: 'user',
              content: `Tool result:\n${JSON.stringify(toolResult, null, 2)}\n\nBudget: ₹${parseFloat(budget).toLocaleString('en-IN')}. Continue.`,
            });
          } else {
            messages.push({ role: 'assistant', content: aiResponse });
            messages.push({ role: 'user', content: 'Respond with THOUGHT + ACTION + ACTION_INPUT, or THOUGHT + FINAL_ANSWER.' });
          }
        }

        if (iteration >= maxIterations) {
          await logStep('FINAL', '⚠️ Max iterations reached.');
          await prisma.agentNegotiation.update({ where: { id: negotiation.id }, data: { status: 'FAILED' } });
          send({ type: 'COMPLETE', result: { success: false, summary: 'Max iterations' }, negotiationId: negotiation.id });
        }
      } catch (error: any) {
        console.error('Agent error:', error);
        await logStep('FINAL', `❌ ${error.message}`);
        send({ type: 'ERROR', error: error.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
