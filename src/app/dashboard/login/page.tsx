'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Column, Feedback, Heading, Input, PasswordInput, Text } from '@once-ui-system/core';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Column as="main" fillWidth center paddingX="16" paddingY="48" style={{ minHeight: '100vh' }}>
      <Column maxWidth={26} background="surface" border radius="xl" padding="32" gap="24">
        <Column horizontal="center" align="center" gap="12">
          <Image src="/images/d79logo.png" alt="District 79 logo" width={96} height={48} priority />
          <Heading as="h1" variant="heading-strong-xl">
            Admin sign in
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Enter your email and password to access the dashboard.
          </Text>
        </Column>
        <form onSubmit={handleSubmit}>
          <Column gap="16">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Feedback variant="danger" description={error} />}
            <Button type="submit" fillWidth size="l" loading={loading} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Column>
        </form>
      </Column>
    </Column>
  );
}
