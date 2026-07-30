import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orgName, orgType, location } = await req.json();

    if (!orgName) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const prompt = `You are an expert web researcher.
Task: Find or logically infer the likely contact person and contact email for a specific organization.
Organization: ${orgName}
Type: ${orgType}
Location: ${location || 'Unknown'}

Since this is for a hackathon demo, if you cannot find exact public real-world contact info, please extrapolate a highly realistic name and professional email address that someone at this organization would use (e.g. director@orgname.org).

Return ONLY a valid JSON object exactly like this, with no markdown formatting:
{
  "contactName": "Rahul Sharma",
  "contactRole": "Director of Partnerships",
  "contactEmail": "rahul.sharma@example.org"
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
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      console.error("Groq API Error:", await res.text());
      throw new Error("Groq API failed");
    }

    const data = await res.json();
    const text = data.choices[0].message.content;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(jsonStr));
    
  } catch (error) {
    console.error("AI Contact Details Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact details" },
      { status: 500 }
    );
  }
}
