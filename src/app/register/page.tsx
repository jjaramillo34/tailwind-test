import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // This page is deprecated. Redirect to /register-programs by default.
  redirect('/register-programs');
  return null;
} 