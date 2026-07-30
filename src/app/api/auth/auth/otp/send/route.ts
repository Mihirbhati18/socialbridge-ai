import { NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { sendOTPEmail } from '@/backend/services/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store in DB - Upsert behavior: only one active OTP per email to prevent spam
    await prisma.verificationCode.upsert({
      where: { email },
      update: {
        code,
        expires,
        createdAt: new Date(),
      },
      create: {
        email,
        code,
        expires,
      },
    });

    const emailResult = await sendOTPEmail(email, code);

    if (emailResult.success) {
      console.log(`OTP sent to ${email} via SMTP`);
      return NextResponse.json({ message: 'OTP sent successfully' });
    } else {
      console.log(`Development Mode: OTP for ${email} is ${code}`);
      return NextResponse.json({ 
        message: 'Development Mode: OTP logged to console', 
        devCode: emailResult.devCode 
      });
    }
  } catch (error: any) {
    console.error('OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
