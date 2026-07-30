import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_USER_EMAIL, toCategorySlug } from '@/lib/categories';
import { computeRankingScore } from '@/lib/ranking';
import { notifyGovPortal } from '@/lib/gov-portal';
import { getSlaDeadline } from '@/lib/sla';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL' && status !== 'All') where.status = status;
    if (category && category !== 'ALL' && category !== 'All') {
      where.category = toCategorySlug(category);
    }
    if (city) where.city = city;

    const rawIssues = await prisma.civicIssue.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, image: true, email: true },
        },
        _count: { select: { updates: true } },
      },
    });

    const maxUpvotes = Math.max(...rawIssues.map((i) => i.upvotes), 0);

    const ranked = rawIssues
      .map((issue) => {
        const scores = computeRankingScore(issue, maxUpvotes);
        return { ...issue, ...scores };
      })
      .sort((a, b) => b.rankingScore - a.rankingScore);

    return NextResponse.json(ranked);
  } catch (error) {
    console.error('Error fetching civic issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      address,
      city,
      lat,
      lng,
      images,
      imageUrl,
      reporterId,
      priority,
    } = body;

    if (!title || !description || !category || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let resolvedReporterId = reporterId as string | undefined;
    if (!resolvedReporterId) {
      const demoUser = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
      if (!demoUser) {
        return NextResponse.json({ error: 'No demo user found. Run db seed.' }, { status: 400 });
      }
      resolvedReporterId = demoUser.id;
    }

    const imageList = Array.isArray(images)
      ? images
      : imageUrl
        ? [imageUrl]
        : typeof images === 'string' && images
          ? [images]
          : [];

    const categorySlug = toCategorySlug(category);
    const slaDeadline = getSlaDeadline(categorySlug);

    const issue = await prisma.civicIssue.create({
      data: {
        title,
        description,
        category: categorySlug,
        status: 'OPEN',
        priority: priority || 'MEDIUM',
        address,
        city: city || 'Mumbai',
        lat: typeof lat === 'number' ? lat : parseFloat(lat) || 19.076,
        lng: typeof lng === 'number' ? lng : parseFloat(lng) || 72.8777,
        images: imageList.filter(Boolean).join(','),
        reporterId: resolvedReporterId,
        slaDeadline,
      },
      include: {
        reporter: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        status: 'OPEN',
        comment: 'Issue reported by citizen.',
        updatedBy: resolvedReporterId,
      },
    });

    notifyGovPortal({
      event: 'ISSUE_CREATED',
      timestamp: new Date().toISOString(),
      issue: {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priority: issue.priority,
        address: issue.address,
        city: issue.city,
        lat: issue.lat,
        lng: issue.lng,
        images: issue.images,
        department: issue.department,
        upvotes: issue.upvotes,
        reporter: issue.reporter
          ? { name: issue.reporter.name, email: issue.reporter.email }
          : null,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating civic issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
