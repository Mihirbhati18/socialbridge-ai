import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { orgId, orgName, status, message } = body;

    if (!orgId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await prisma.collabResponse.create({
      data: {
        collabRequestId: id,
        organizationId: orgId,
        status,
        message: message || ''
      }
    });

    if (status === 'ACCEPTED') {
      await prisma.collabRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
      
      const collab = await prisma.collabRequest.findUnique({ where: { id }});
      if (collab) {
          const partnership = await prisma.partnership.create({
              data: {
                  title: collab.title,
                  description: collab.description,
                  status: 'ACTIVE',
                  startDate: new Date(),
              }
          });
          
          await prisma.partnershipOrg.createMany({
              data: [
                  { partnershipId: partnership.id, organizationId: collab.creatorId },
                  { partnershipId: partnership.id, organizationId: orgId }
              ]
          });
      }
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error responding to collab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
