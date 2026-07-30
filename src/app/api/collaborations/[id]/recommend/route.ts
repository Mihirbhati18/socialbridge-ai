import { NextResponse } from 'next/server';
import { getRecommendations } from '@/backend/services/partnershipEngine';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const recommendations = await getRecommendations(id);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
