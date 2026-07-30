import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyGovPortal } from '@/lib/gov-portal';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const issue = await prisma.civicIssue.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, image: true, email: true },
        },
        updates: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, department, priority, comment, updatedBy } = body;

    const existing = await prisma.civicIssue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const updatedIssue = await prisma.civicIssue.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(department !== undefined ? { department } : {}),
      },
      include: {
        reporter: {
          select: { id: true, name: true, image: true, email: true },
        },
        updates: { orderBy: { createdAt: 'asc' } },
      },
    });

    const statusChanged = status && status !== existing.status;

    if (statusChanged) {
      await prisma.issueUpdate.create({
        data: {
          issueId: id,
          status,
          comment: comment || `Status updated to ${status}`,
          updatedBy: updatedBy || 'Official',
        },
      });
    }

    notifyGovPortal({
      event: 'ISSUE_UPDATED',
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
      update: statusChanged
        ? {
            previousStatus: existing.status,
            newStatus: status,
            comment: comment || undefined,
            updatedBy: updatedBy || 'Official',
          }
        : undefined,
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
