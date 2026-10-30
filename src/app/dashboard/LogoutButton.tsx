'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@once-ui-system/core';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/dashboard/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="s" prefixIcon="logout" onClick={handleLogout} loading={loading}>
      Log out
    </Button>
  );
}
