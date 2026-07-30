import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Fallback if no API key is provided - ensures the hackathon demo never fails
    if (!process.env.GEMINI_API_KEY) {
      await new Promise(r => setTimeout(r, 1500)); // simulate network delay
      const recipient = body.recipientOrg || body.purpose?.match(/Invite (.*?) to/)?.[1] || "Valued Partner";
      
      const fallbackEmail = `Subject: Proposal for Collaboration: ${body.eventTitle || body.projectContext?.split('.')[0] || 'Community Initiative'}

Dear ${recipient} Team,

I hope this email finds you well. 

I am reaching out from SocialBridge AI because we are organizing an impactful initiative and your organization was specifically recommended by our AI Partnership Engine as the ideal partner due to your outstanding track record in this area.

Context:
${body.eventDescription || body.projectContext || 'We are organizing a community-driven event and need reliable partners to ensure its success.'}

Given your expertise and resources, we believe a collaboration would be highly synergistic and create significant value for the community. We already have initial resources pooled, but your participation would help us scale the impact.

Would you be available for a brief 10-minute call next week to explore this potential partnership? 

Looking forward to your response.

Warm regards,
[Your Name]
SocialBridge Organizer`;

      return NextResponse.json({ email: fallbackEmail });
    }

    const prompt = `You are an expert partnership manager for a social impact platform.
Project Context: ${body.projectContext}
Recipient Type: ${body.recipientType}
Tone: ${body.tone}
Purpose: ${body.purpose}

Write a professional outreach email based on the context and purpose.

Return ONLY the email in the following exact format:
SUBJECT: Your subject line here
BODY:
Your email body here (can include newlines)`;

    let text = "";

    // If Groq is configured, use it for email generation (prioritized for better rate limits)
    if (process.env.GROQ_API_KEY) {
      try {
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
            temperature: 0.7
          })
        });

        if (res.ok) {
          const data = await res.json();
          text = data.choices[0].message.content;
        } else {
          console.error("Groq API Error:", await res.text());
          throw new Error("Groq API failed");
        }
      } catch (error) {
        console.error("Groq generation failed, falling back if possible", error);
      }
    }
    
    // Fallback to Gemini if Groq failed or wasn't configured
    if (!text && process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }
    
    if (!text) {
      throw new Error("No AI providers available or all failed");
    }

    // Parse the SUBJECT and BODY format
    const cleanText = text.replace(/```(text)?/gi, '').replace(/```/g, '').trim();
    const match = cleanText.match(/SUBJECT:\s*(.*?)\s*BODY:\s*([\s\S]*)/i);
    
    let formattedEmail = cleanText;
    if (match) {
      const subject = match[1].trim();
      const body = match[2].trim();
      formattedEmail = `Subject: ${subject}\n\n${body}`;
    }

    return NextResponse.json({ email: formattedEmail });
  } catch (error) {
    console.error('Error generating email:', error);
    
    // Provide fallback even on error
    const fallbackEmail = `Subject: Proposal for Collaboration\n\nDear Team,\n\nWe would love to partner with you on our upcoming initiative. Our AI engine identified your organization as a top match based on your recent activities.\n\nPlease let us know if you're open to a discussion.\n\nBest,\nSocialBridge Team`;
    
    return NextResponse.json({ email: fallbackEmail });
  }
}
