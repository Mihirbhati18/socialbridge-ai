import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { to, subject, body, fromName = 'SocialBridge' } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required email fields (to, subject, body)' },
        { status: 400 }
      );
    }

    // If Resend is NOT configured, simulate success (Hackathon fallback)
    if (!resend) {
      console.log('--- SIMULATED EMAIL SEND ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${body}`);
      console.log('----------------------------');
      
      return NextResponse.json({ 
        success: true, 
        simulated: true, 
        message: 'Email simulated successfully (Add RESEND_API_KEY to send real emails)' 
      });
    }

    // Actually send the real email using Resend
    // Note: Free Resend accounts can only send from 'onboarding@resend.dev' or verified domains.
    const { data, error } = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`,
      to,
      subject,
      text: body, // We use plain text based on the AI output
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Internal Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
