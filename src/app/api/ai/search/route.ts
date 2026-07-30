import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let parsedFilters = {
      types: [] as string[],
      location: "",
      intent: "",
      realWorldSuggestions: [] as any[]
    };

    // If Groq is configured, use it for NLP parsing (prioritized for better rate limits)
    if (process.env.GROQ_API_KEY) {
      try {
        const prompt = `You are an AI for a social impact platform.
User Query: "${query}"

1. Extract the search intent.
2. Identify ALL Organization Types needed. (e.g., if they need a venue or space, MUST include "School". If they need support/volunteers, MUST include "NGO").
3. Act as a Web Search Agent: based on the query and location, suggest 6 to 8 REAL-WORLD organizations that exist there. 
4. CRITICAL: Ensure extreme diversity! Include highly rated, well-known organizations, but ALSO explicitly include smaller, unrated, or new organizations (give them rating: 0, totalEvents: 0). Do not assume 0 past events means they won't help!

Return ONLY a valid JSON object exactly like this, with no markdown formatting:
{
  "types": ["NGO", "School"],
  "location": "Mumbai",
  "intent": "Tech fest for underprivileged kids",
  "realWorldSuggestions": [
    {
      "id": "web-1",
      "name": "Teach For India",
      "type": "NGO",
      "address": "Mumbai, Maharashtra",
      "rating": 4.9,
      "totalEvents": 150,
      "successfulEvents": 145,
      "isWebResult": true,
      "matchReason": "Excellent network of volunteers to support your tech feast for underprivileged kids.",
      "lat": 19.076,
      "lng": 72.8777
    }
  ]
}`;

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.4
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices[0].message.content;
          const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedFilters = JSON.parse(jsonStr);
        } else {
          console.error("Groq API Error:", await res.text());
        }
      } catch (aiError) {
        console.error("Groq Parsing Error:", aiError);
      }
    } 
    // Fallback to Gemini if Groq is not configured
    else if (process.env.GEMINI_API_KEY && (!parsedFilters.types || parsedFilters.types.length === 0)) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        const prompt = `You are an AI for a social impact platform.
User Query: "${query}"

1. Extract the search intent.
2. Identify Organization Types needed (e.g. if they need a venue, return "School". If they need support/volunteers for kids, return "NGO").
3. Act as a Web Search Agent: based on the query and location, suggest 3-4 REAL-WORLD organizations (NGOs, Schools, Companies) that actually exist in that location and would be a perfect fit. 

Return ONLY a JSON object exactly like this:
{
  "types": ["NGO", "School"],
  "location": "Mumbai",
  "intent": "Tech fest for underprivileged kids",
  "realWorldSuggestions": [
    {
      "id": "web-1",
      "name": "Teach For India",
      "type": "NGO",
      "address": "Mumbai, Maharashtra",
      "rating": 4.9,
      "totalEvents": 150,
      "successfulEvents": 145,
      "isWebResult": true,
      "lat": 19.076,
      "lng": 72.8777
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedFilters = JSON.parse(jsonStr);
      } catch (aiError) {
        console.error("Gemini Parsing Error:", aiError);
      }
    }

    // Fallback parsing if AI fails or key is missing
    if (!parsedFilters.types || parsedFilters.types.length === 0) {
      const q = query.toLowerCase();
      if (q.includes('school') || q.includes('college') || q.includes('venue') || q.includes('place')) parsedFilters.types.push('School');
      if (q.includes('ngo') || q.includes('non profit') || q.includes('support') || q.includes('poor')) parsedFilters.types.push('NGO');
      if (q.includes('hospital') || q.includes('medical') || q.includes('blood')) parsedFilters.types.push('Hospital');
      if (q.includes('company') || q.includes('sponsor')) parsedFilters.types.push('Company');
      
      // Basic location extraction for fallback
      const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'chennai', 'hyderabad', 'bandra', 'andheri'];
      for (const city of cities) {
        if (q.includes(city)) {
          // Capitalize first letter
          parsedFilters.location = city.charAt(0).toUpperCase() + city.slice(1);
          break;
        }
      }
      
      parsedFilters.intent = query.substring(0, 50);
      parsedFilters.realWorldSuggestions = [];
    }

    // Build Prisma query
    const whereClause: any = {};
    if (parsedFilters.types && parsedFilters.types.length > 0) {
      whereClause.type = { in: parsedFilters.types };
    }
    
    // Add location search if we found a location
    if (parsedFilters.location) {
      whereClause.OR = [
        { city: { contains: parsedFilters.location } },
        { address: { contains: parsedFilters.location } }
      ];
    }

    // Execute query
    const dbResults = await prisma.organization.findMany({
      where: whereClause,
      orderBy: [
        { successfulEvents: 'desc' },
        { rating: 'desc' }
      ],
      take: 20
    });

    // Combine DB results with AI Web Search results
    const combinedResults = [...dbResults, ...(parsedFilters.realWorldSuggestions || [])];

    return NextResponse.json({
      intent: parsedFilters.intent || "General Search",
      parsedTypes: parsedFilters.types,
      results: combinedResults
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
