import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const partnerships = await prisma.partnership.findMany({
      include: {
        request: true,
        orgs: {
          include: {
            organization: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 });
  }
}
