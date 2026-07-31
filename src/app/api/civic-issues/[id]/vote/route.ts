import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { DEMO_USER_EMAIL } from '@/lib/categories';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const issueId = (await params).id;

    // Check if user already voted
    const existingVote = await prisma.issueVote.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId: user.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Create vote and increment voteCount in a transaction
    await prisma.$transaction([
      prisma.issueVote.create({
        data: {
          issueId,
          userId: user.id,
        },
      }),
      prisma.civicIssue.update({
        where: { id: issueId },
        data: {
          voteCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting for issue:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
