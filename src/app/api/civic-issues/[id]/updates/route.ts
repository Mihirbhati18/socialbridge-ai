import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json([
      {
        id: 'upd_1',
        issueId: id,
        status: 'OPEN',
        comment: 'Issue reported by user.',
        updatedBy: 'System',
        createdAt: new Date().toISOString(),
      }
    ]);
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, comment, updatedBy } = body;

    const newUpdate = {
      id: `upd_${Date.now()}`,
      issueId: id,
      status,
      comment,
      updatedBy: updatedBy || 'Official',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newUpdate, { status: 201 });
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}
