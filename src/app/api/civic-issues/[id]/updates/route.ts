import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyGovPortal } from '@/lib/gov-portal';
import { notifyIssueSubscribers } from '@/lib/notifications';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updates = await prisma.issueUpdate.findMany({
      where: { issueId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, comment, updatedBy } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const issue = await prisma.civicIssue.findUnique({ where: { id } });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.issueUpdate.create({
        data: {
          issueId: id,
          status,
          comment: comment || null,
          updatedBy: updatedBy || 'Official',
        },
      }),
      prisma.civicIssue.update({
        where: { id },
        data: { status },
      }),
    ]);

    const updatedIssue = await prisma.civicIssue.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    if (updatedIssue) {
      notifyGovPortal({
        event: 'STATUS_CHANGED',
        timestamp: new Date().toISOString(),
        issue: {
          id: updatedIssue.id,
          title: updatedIssue.title,
          description: updatedIssue.description,
          category: updatedIssue.category,
          status: updatedIssue.status,
          priority: updatedIssue.priority,
          address: updatedIssue.address,
          city: updatedIssue.city,
          lat: updatedIssue.lat,
          lng: updatedIssue.lng,
          images: updatedIssue.images,
          department: updatedIssue.department,
          upvotes: updatedIssue.upvotes,
          reporter: updatedIssue.reporter
            ? { name: updatedIssue.reporter.name, email: updatedIssue.reporter.email }
            : null,
          createdAt: updatedIssue.createdAt.toISOString(),
          updatedAt: updatedIssue.updatedAt.toISOString(),
        },
        update: {
          previousStatus: issue.status,
          newStatus: status,
          comment: comment || undefined,
          updatedBy: updatedBy || 'Official',
        },
      });
    }

    // Notify subscribers
    await notifyIssueSubscribers(id, status, comment || undefined);

    const newUpdate = await prisma.issueUpdate.findFirst({
      where: { issueId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(newUpdate, { status: 201 });
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}
