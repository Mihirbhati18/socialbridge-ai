import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_USER_EMAIL, toCategorySlug } from '@/lib/categories';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};
    if (status && status !== 'All') where.status = status;
    if (category && category !== 'All') where.category = toCategorySlug(category);
    if (city) where.city = city;

    const collabs = await prisma.collabRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: true,
        org: true,
        _count: { select: { responses: true } },
      },
    });

    return NextResponse.json(collabs);
  } catch (error) {
    console.error('Error fetching collabs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      requiredPartners,
      city,
      state,
      date,
      budget,
      volunteersNeeded,
      creatorId,
      lat,
      lng,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let resolvedCreatorId = creatorId as string | undefined;
    if (!resolvedCreatorId) {
      const demoUser = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
      if (!demoUser) {
        return NextResponse.json({ error: 'No demo user found. Run db seed.' }, { status: 400 });
      }
      resolvedCreatorId = demoUser.id;
    }

    const collab = await prisma.collabRequest.create({
      data: {
        title,
        description,
        category: toCategorySlug(category),
        requiredPartners: requiredPartners || '',
        city: city || 'Mumbai',
        state: state || 'Maharashtra',
        eventDate: date ? new Date(date) : null,
        budget: budget ? parseFloat(budget) : null,
        volunteersNeeded: volunteersNeeded ? parseInt(volunteersNeeded, 10) : null,
        lat: lat ? parseFloat(lat) : 19.076,
        lng: lng ? parseFloat(lng) : 72.8777,
        status: 'OPEN',
        creatorId: resolvedCreatorId,
      },
    });

    return NextResponse.json(collab, { status: 201 });
  } catch (error) {
    console.error('Error creating collab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
