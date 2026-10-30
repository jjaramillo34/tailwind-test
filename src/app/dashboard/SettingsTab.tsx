'use client';

import { useState } from 'react';
import {
  Button,
  Column,
  Feedback,
  Heading,
  PasswordInput,
  Row,
  Text,
} from '@once-ui-system/core';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Message = { type: 'success' | 'error'; text: string } | null;

function MessageFeedback({ message }: { message: Message }) {
  if (!message) return null;
  return <Feedback variant={message.type === 'success' ? 'success' : 'danger'} description={message.text} />;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Column background="surface" border radius="l" padding="24" gap="20">
      <Column gap="4">
        <Heading as="h3" variant="heading-strong-m">
          {title}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      {children}
    </Column>
  );
}

export default function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<Message>(null);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupOrphans = async () => {
    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const response = await fetch('/api/admin/registrations/cleanup-orphans', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setCleanupMessage({
          type: 'success',
          text: `Cleanup complete. Deleted ${data.deletedCount ?? 0} orphan registration(s).`,
        });
      } else {
        setCleanupMessage({
          type: 'error',
          text: data.message || 'Failed to clean orphan registrations',
        });
      }
    } catch {
      setCleanupMessage({
        type: 'error',
        text: 'An error occurred while cleaning orphan registrations.',
      });
    } finally {
      setCleanupLoading(false);
      setConfirmCleanup(false);
    }
  };

  return (
    <Column gap="24" maxWidth="s">
      <Heading as="h2" variant="heading-strong-l">
        Settings
      </Heading>

      <Section title="Change admin password" description="Use at least 6 characters.">
        <form onSubmit={handlePasswordChange}>
          <Column gap="16">
            <PasswordInput
              id="current-password"
              label="Current password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordInput
              id="new-password"
              label="New password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordInput
              id="confirm-password"
              label="Confirm new password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={mismatch}
              errorMessage={mismatch ? 'Passwords do not match' : undefined}
            />
            <MessageFeedback message={message} />
            <Row>
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Changing…' : 'Change password'}
              </Button>
            </Row>
          </Column>
        </form>
      </Section>

      <Section
        title="Data maintenance"
        description="Remove registrations that reference events that were deleted."
      >
        <Row>
          <Button
            variant="warning"
            prefixIcon="trash"
            onClick={() => setConfirmCleanup(true)}
            loading={cleanupLoading}
          >
            Clean orphan registrations
          </Button>
        </Row>
        <MessageFeedback message={cleanupMessage} />
      </Section>

      <Section
        title="System information"
        description="Passwords are securely hashed and stored in the database."
      >
        <Column gap="8">
          <Row gap="8">
            <Text variant="label-strong-s">Database</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">MongoDB</Text>
          </Row>
          <Row gap="8">
            <Text variant="label-strong-s">Event management</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">Full CRUD operations available</Text>
          </Row>
        </Column>
      </Section>

      <ConfirmDialog
        open={confirmCleanup}
        onClose={() => setConfirmCleanup(false)}
        loading={cleanupLoading}
        tone="danger"
        title="Clean orphan registrations?"
        description="Registrations linked to events that no longer exist will be permanently deleted."
        confirmLabel="Delete orphans"
        onConfirm={handleCleanupOrphans}
      />
    </Column>
  );
}
