import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: Request) {
  try {
    const now = new Date();

    // 1. Find issues that have breached SLA but aren't escalated yet
    const breachedIssues = await prisma.civicIssue.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        slaDeadline: { lt: now },
        isEscalated: false,
      },
      include: {
        reporter: true,
      }
    });

    const results = [];

    for (const issue of breachedIssues) {
      // Escalation logic:
      // - Update isEscalated to true
      // - Bump priority if not URGENT
      // - Add a system update
      // - Send notification to reporter/subscribers (simulated for govt too)

      let newPriority = issue.priority;
      if (issue.priority === 'LOW') newPriority = 'MEDIUM';
      else if (issue.priority === 'MEDIUM') newPriority = 'HIGH';
      else if (issue.priority === 'HIGH') newPriority = 'URGENT';

      await prisma.$transaction([
        prisma.civicIssue.update({
          where: { id: issue.id },
          data: {
            isEscalated: true,
            priority: newPriority,
          },
        }),
        prisma.issueUpdate.create({
          data: {
            issueId: issue.id,
            status: issue.status,
            comment: '⚠️ SLA BREACHED: This issue has exceeded its target resolution time and has been auto-escalated.',
            updatedBy: 'System',
          },
        }),
        prisma.slaEvent.create({
          data: {
            issueId: issue.id,
            type: 'BREACH',
            comment: `Deadline was ${issue.slaDeadline?.toISOString()}`,
          },
        }),
      ]);

      // Notify reporter
      await sendNotification({
        userId: issue.reporterId,
        title: `Priority Escalated: ${issue.title}`,
        message: `Your reported issue has been auto-escalated to ${newPriority} priority due to a delay in response.`,
        type: 'SLA_BREACH',
        link: `/civic-issues/${issue.id}`,
        email: issue.reporter.email,
      });

      results.push({ id: issue.id, status: 'Escalated' });
    }

    return NextResponse.json({ 
      processed: results.length,
      details: results 
    });
  } catch (error) {
    console.error('Error in SLA check cron:', error);
    return NextResponse.json({ error: 'SLA check failed' }, { status: 500 });
  }
}
