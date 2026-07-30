import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    const where: any = {};
    if (status && status !== 'All') where.status = status;
    if (category && category !== 'All') where.category = category;
    if (city) where.city = city;

    const collabs = await prisma.collabRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: true
      }
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
    const { title, description, category, requiredPartners, city, date, budget, volunteersNeeded, creatorId } = body;

    if (!title || !description || !category || !creatorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collab = await prisma.collabRequest.create({
      data: {
        title,
        description,
        category,
        requiredPartners,
        city,
        date: date ? new Date(date) : null,
        budget: budget ? parseFloat(budget) : null,
        volunteersNeeded: volunteersNeeded ? parseInt(volunteersNeeded) : null,
        status: 'OPEN',
        creatorId
      }
    });

    return NextResponse.json(collab, { status: 201 });
  } catch (error) {
    console.error('Error creating collab:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
