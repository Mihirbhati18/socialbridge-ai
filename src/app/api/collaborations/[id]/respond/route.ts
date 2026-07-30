import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { orgId, orgName, status, message } = body;

    if (!orgId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collab = await prisma.collabRequest.findUnique({
      where: { id },
      include: { partnership: true },
    });

    if (!collab) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const response = await prisma.collabResponse.create({
      data: {
        requestId: id,
        orgId,
        orgName: orgName || org.name,
        status,
        message: message || '',
      },
    });

    let partnershipId: string | null = collab.partnership?.id ?? null;

    if (status === 'ACCEPTED') {
      await prisma.collabRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });

      if (!partnershipId) {
        const partnership = await prisma.partnership.create({
          data: {
            requestId: id,
            status: 'ACTIVE',
            startDate: new Date(),
          },
        });
        partnershipId = partnership.id;

        const orgLinks: { partnershipId: string; orgId: string; role: string }[] = [
          { partnershipId: partnership.id, orgId, role: 'PARTNER' },
        ];

        if (collab.orgId && collab.orgId !== orgId) {
          orgLinks.push({
            partnershipId: partnership.id,
            orgId: collab.orgId,
            role: 'HOST',
          });
        }

        await prisma.partnershipOrg.createMany({ data: orgLinks });

        await prisma.workspaceMessage.create({
          data: {
            partnershipId: partnership.id,
            senderName: 'SocialBridge AI',
            senderRole: 'SYSTEM',
            content: `Partnership started! ${org.name} joined "${collab.title}". Use AI Quick Actions to generate an action plan, outreach email, or full proposal.`,
          },
        });
      } else {
        const existing = await prisma.partnershipOrg.findFirst({
          where: { partnershipId, orgId },
        });
        if (!existing) {
          await prisma.partnershipOrg.create({
            data: { partnershipId, orgId, role: 'PARTNER' },
          });
        }
      }
    }

    return NextResponse.json({ ...response, partnershipId }, { status: 201 });
  } catch (error) {
    console.error('Error responding to collab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
