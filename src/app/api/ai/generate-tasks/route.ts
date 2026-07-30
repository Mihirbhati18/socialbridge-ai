import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { partnershipId, eventTitle, eventDescription, eventCategory } = await req.json();

    const prompt = `Generate 8-10 actionable tasks for organizing this event.
Event Title: ${eventTitle}
Event Description: ${eventDescription}
Event Category: ${eventCategory || 'General'}

Return ONLY a JSON array of objects with this structure (no markdown tags):
[
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "HIGH" | "MEDIUM" | "LOW"
  }
]`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const tasksData = JSON.parse(jsonStr);

    const createdTasks = await prisma.$transaction(
      tasksData.map((task: any) =>
        prisma.task.create({
          data: {
            partnershipId,
            title: task.title,
            description: task.description,
            priority: task.priority || 'MEDIUM',
            status: 'TODO',
          },
        })
      )
    );

    return NextResponse.json(createdTasks);
  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 });
  }
}
