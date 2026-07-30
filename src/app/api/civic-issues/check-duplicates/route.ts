import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { haversineDistance } from '@/lib/utils';
import { generateJSON } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { title, description, lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ duplicates: [] });
    }

    // 1. Find issues within 100m radius (widened slightly from 50m for better recall)
    const nearbyIssues = await prisma.civicIssue.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      select: {
        id: true,
        title: true,
        description: true,
        lat: true,
        lng: true,
      },
    });

    const candidates = nearbyIssues.filter(issue => {
      const distance = haversineDistance(lat, lng, issue.lat, issue.lng);
      return distance <= 0.1; // 100 meters
    });

    if (candidates.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    // 2. Use AI to check semantic similarity for candidates
    const duplicateResults = [];

    for (const candidate of candidates) {
      const prompt = `
        Compare these two civic issue reports and determine if they refer to the same physical issue at the same location.
        
        Report A:
        Title: ${title}
        Description: ${description}
        
        Report B:
        Title: ${candidate.title}
        Description: ${candidate.description}
        
        Return a JSON object with:
        "isDuplicate": boolean,
        "confidence": number (0 to 1),
        "reason": short string explaining why
      `;

      const aiResult = await generateJSON(prompt);
      
      if (aiResult && aiResult.isDuplicate && aiResult.confidence > 0.7) {
        duplicateResults.push({
          ...candidate,
          confidence: aiResult.confidence,
          reason: aiResult.reason
        });
      }
    }

    return NextResponse.json({ duplicates: duplicateResults });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return NextResponse.json({ error: 'Failed to check duplicates' }, { status: 500 });
  }
}
