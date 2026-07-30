import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';

export async function GET() {
  try {
    // Try to query the database
    await prisma.user.count();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed', 
      error: error.message 
    }, { status: 500 });
  }
}
