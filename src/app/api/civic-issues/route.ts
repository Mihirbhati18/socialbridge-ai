import { NextResponse } from 'next/server';

// Mock data to use when DB is not available
const mockIssues = [
  {
    id: 'iss_1',
    title: 'Large Pothole on Main St',
    description: 'There is a massive pothole causing traffic slowdowns and potential vehicle damage.',
    category: 'ROAD',
    status: 'OPEN',
    priority: 'HIGH',
    address: 'Main St & 4th Ave, Mumbai',
    city: 'Mumbai',
    lat: 19.076,
    lng: 72.8777,
    images: [],
    reporterId: 'usr_1',
    reporter: { name: 'Rahul Sharma', avatarUrl: null },
    upvotes: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    let filteredIssues = [...mockIssues];
    
    if (status && status !== 'ALL') {
      filteredIssues = filteredIssues.filter(i => i.status === status);
    }
    if (category && category !== 'ALL') {
      filteredIssues = filteredIssues.filter(i => i.category === category);
    }
    if (city) {
      filteredIssues = filteredIssues.filter(i => i.city === city);
    }

    return NextResponse.json(filteredIssues);
  } catch (error) {
    console.error('Error fetching civic issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, address, city, lat, lng, images, reporterId, priority } = body;

    const newIssue = {
      id: `iss_${Date.now()}`,
      title,
      description,
      category,
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      address,
      city: city || 'Mumbai',
      lat: lat || 19.076,
      lng: lng || 72.8777,
      images: images ? [images] : [],
      reporterId: reporterId || 'usr_1',
      reporter: { name: 'Current User', avatarUrl: null },
      upvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockIssues.unshift(newIssue);

    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    console.error('Error creating civic issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
