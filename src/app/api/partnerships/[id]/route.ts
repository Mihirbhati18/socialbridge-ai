import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const partnership = await prisma.partnership.findUnique({
      where: { id },
      include: {
        collabRequest: true,
        orgs: {
          include: {
            organization: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Reverse messages to get chronological order (since we fetched desc for latest 20)
    partnership.messages = partnership.messages.reverse();

    return NextResponse.json(partnership);
  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 });
  }
}
