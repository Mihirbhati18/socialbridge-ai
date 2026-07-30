import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { partnershipId, eventTitle, eventDescription, eventCategory, organizations, date, location } = await req.json();

    const prompt = `Write a comprehensive event proposal document in Markdown format.
Event Title: ${eventTitle}
Event Description: ${eventDescription}
Category: ${eventCategory}
Partnering Organizations: ${organizations?.join(', ') || 'Various'}
Date: ${date || 'TBD'}
Location: ${location || 'TBD'}

Include the following sections:
# Overview
# Objectives
# Timeline
# Resources Needed
# Expected Impact
# Budget Estimate`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    const document = await prisma.document.create({
      data: {
        partnershipId,
        title: `${eventTitle} - Proposal`,
        content,
        type: 'PROPOSAL',
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error generating proposal:', error);
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 });
  }
}
