import { NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { CIVIC_CATEGORIES } from '@/lib/categories';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ suggestion: null });
    }

    const categoriesList = CIVIC_CATEGORIES.map(c => c.value).join(', ');

    const prompt = `
      As a civic issue triage assistant, analyze the following description and suggest the most appropriate category and priority level.
      
      Description: "${description}"
      
      Available Categories: [${categoriesList}]
      Available Priorities: [LOW, MEDIUM, HIGH, URGENT]
      
      Return a JSON object with:
      "category": one of the available categories,
      "priority": one of the available priorities,
      "confidence": number (0 to 1),
      "reason": brief explanation
    `;

    const aiResult = await generateJSON(prompt);

    return NextResponse.json({ suggestion: aiResult });
  } catch (error) {
    console.error('Error in auto-triage:', error);
    return NextResponse.json({ error: 'Failed to triage issue' }, { status: 500 });
  }
}
