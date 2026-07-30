import { prisma } from './prisma';

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  email?: string;
  channels?: string[];
}

export async function sendNotification({
  userId,
  title,
  message,
  type,
  link,
  email,
  channels = ['IN_APP', 'EMAIL']
}: SendNotificationParams) {
  try {
    // 1. In-App Notification
    if (channels.includes('IN_APP')) {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
        }
      });
    }

    // 2. Email Notification
    if (channels.includes('EMAIL') && email) {
      // We call our own API route to handle the email sending logic (which has the simulator fallback)
      // Since this is server-side, we can import the logic directly or use a fetch. 
      // Direct fetch is easier for a Next.js environment to keep the "Resend simulator" logic in one place.
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      try {
        await fetch(`${baseUrl}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: title,
            body: message,
            fromName: 'SocialBridge AI'
          })
        });
      } catch (err) {
        console.error('Failed to call email API:', err);
      }
    }
    
    // 3. SMS Notification (Placeholder for future implementation)
    if (channels.includes('SMS')) {
      console.log(`[SMS Placeholder] To user ${userId}: ${message}`);
    }

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function notifyIssueSubscribers(issueId: string, status: string, comment?: string) {
  try {
    const issue = await prisma.civicIssue.findUnique({
      where: { id: issueId },
      include: {
        subscriptions: true,
        reporter: true,
      }
    });

    if (!issue) return;

    const title = `Issue Update: ${issue.title}`;
    const message = `The status of the issue "${issue.title}" has been changed to ${status}.${comment ? `\n\nComment: ${comment}` : ''}`;
    const link = `/civic-issues/${issue.id}`;

    // Notify reporter if not subscribed (already included in subscriptions?)
    // Actually, subscriptions is a separate model.
    
    // Get all unique user IDs to notify
    const subscribers = issue.subscriptions;
    
    // Add reporter to the list if not already there
    if (!subscribers.find(s => s.userId === issue.reporterId)) {
        await sendNotification({
            userId: issue.reporterId,
            title,
            message,
            type: 'ISSUE_UPDATE',
            link,
            email: issue.reporter.email,
        });
    }

    for (const sub of subscribers) {
      await sendNotification({
        userId: sub.userId,
        title,
        message,
        type: 'ISSUE_UPDATE',
        link,
        email: sub.email,
        channels: sub.channels.split(',')
      });
    }
  } catch (error) {
    console.error('Error notifying subscribers:', error);
  }
}
