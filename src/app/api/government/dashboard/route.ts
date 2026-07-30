import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = {
      totalIssues: 124,
      openIssues: 45,
      assignedIssues: 30,
      inProgressIssues: 25,
      resolvedIssues: 24,
      categoryBreakdown: [
        { name: 'Roads', value: 40 },
        { name: 'Garbage', value: 35 },
        { name: 'Water', value: 20 },
        { name: 'Electricity', value: 15 },
        { name: 'Drainage', value: 14 }
      ],
      recentIssues: [
        { id: 'iss_1', title: 'Pothole on Main St', category: 'ROAD', status: 'OPEN', priority: 'HIGH', reporter: 'Rahul S.', date: new Date().toISOString() },
        { id: 'iss_2', title: 'Streetlight out', category: 'ELECTRICITY', status: 'IN_PROGRESS', priority: 'MEDIUM', reporter: 'Priya M.', date: new Date().toISOString() },
        { id: 'iss_3', title: 'Overflowing bin', category: 'GARBAGE', status: 'RESOLVED', priority: 'LOW', reporter: 'Amit P.', date: new Date().toISOString() },
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
