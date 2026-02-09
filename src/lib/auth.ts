import { cookies } from 'next/headers';
import connectDB from './mongodb';
import User from './models/User';

export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim(), role: 'admin' });
    
    if (!user) {
      return false;
    }
    
    return await user.comparePassword(password);
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin-auth', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin-auth');
    
    if (!authCookie?.value) {
      return false;
    }
    
    await connectDB();
    const user = await User.findOne({ 
      email: authCookie.value.toLowerCase().trim(), 
      role: 'admin' 
    });
    
    return !!user;
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin-auth');
    return authCookie?.value || null;
  } catch (error) {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-auth');
}
