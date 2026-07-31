import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { DEMO_USER_EMAIL } from '@/lib/categories';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { channels } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const issueId = (await params).id;

    const subscription = await prisma.issueSubscription.upsert({
      where: {
        issueId_userId: {
          issueId,
          userId: user.id,
        },
      },
      update: {
        channels: channels?.join(',') || 'EMAIL,IN_APP',
      },
      create: {
        issueId,
        userId: user.id,
        email: user.email,
        phone: user.phone,
        channels: channels?.join(',') || 'EMAIL,IN_APP',
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error subscribing to issue:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.issueSubscription.delete({
      where: {
        issueId_userId: {
          issueId: params.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
