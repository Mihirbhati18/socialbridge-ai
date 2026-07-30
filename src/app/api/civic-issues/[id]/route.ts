import { NextResponse } from 'next/server';

const mockIssue = {
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
  updates: [
    {
      id: 'upd_1',
      status: 'OPEN',
      comment: 'Issue reported by user.',
      updatedBy: 'System',
      createdAt: new Date().toISOString(),
    }
  ]
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json({ ...mockIssue, id });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, department, priority } = body;

    const updatedIssue = {
      ...mockIssue,
      id,
      status: status || mockIssue.status,
      priority: priority || mockIssue.priority,
      department: department || 'General',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
