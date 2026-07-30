import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const collab = await prisma.collabRequest.findUnique({
      where: { id },
      include: {
        creator: true,
        responses: true
      }
    });

    if (!collab) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(collab);
  } catch (error) {
    console.error('Error fetching collab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
