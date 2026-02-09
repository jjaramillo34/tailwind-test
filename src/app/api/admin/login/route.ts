import { NextResponse } from 'next/server';
import { verifyAdmin, setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith('@schools.nyc.gov')) {
      return NextResponse.json(
        { message: 'Invalid email domain. Must be @schools.nyc.gov' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdmin(email, password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await setAdminSession(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
