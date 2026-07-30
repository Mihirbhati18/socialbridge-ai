import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const partnership = await prisma.partnership.findUnique({
      where: { id },
      include: {
        request: {
          include: { creator: true },
        },
        orgs: {
          include: {
            org: true,
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
          take: 50,
        },
      },
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...partnership,
      messages: [...partnership.messages].reverse(),
      // aliases for any older UI that still expects these names
      collabRequest: partnership.request,
      orgs: partnership.orgs.map((o) => ({
        ...o,
        organization: o.org,
      })),
    });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 });
  }
}
