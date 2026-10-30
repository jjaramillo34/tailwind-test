import { Column, Grid, Heading, Icon, Row, Text, ThemeSwitcher } from '@once-ui-system/core';
import type { IconName } from '@once-ui-system/core';
import connectDB from '@/lib/mongodb';
import Event, { activeEventFilter } from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import RegistrationsTable from './RegistrationsTable';
import EventsManager from './EventsManager';
import SettingsTab from './SettingsTab';
import DashboardTabs from './DashboardTabs';
import LogoutButton from './LogoutButton';
import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

function StatCard({ icon, label, value }: { icon: IconName; label: string; value: number }) {
  return (
    <Column background="surface" border radius="l" padding="20" gap="8">
      <Row gap="8" vertical="center">
        <Icon name={icon} size="xs" onBackground="brand-medium" />
        <Text variant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>
      </Row>
      <Text variant="display-strong-xs">{value.toLocaleString('en-US')}</Text>
    </Column>
  );
}

export default async function DashboardPage() {
  const isAuthenticated = await isAdminAuthenticated();
  
  if (!isAuthenticated) {
    redirect('/dashboard/login');
  }

  await connectDB();
  
  // Fetch all registrations with event info
  const [registrations, activeEventCount] = await Promise.all([
    EventsRegistration.find({}).populate('eventId').sort({ createdAt: 'desc' }),
    Event.countDocuments(activeEventFilter),
  ]);

  // Convert dates to string for client component.
  // Some registrations can reference events that were deleted; populate() returns null in that case.
  const registrationsForClient = registrations.map((r) => {
    const populatedEvent = r.eventId && typeof r.eventId === 'object' && '_id' in (r.eventId as any)
      ? (r.eventId as any)
      : null;

    const fallbackEventId =
      populatedEvent?._id?.toString?.() ??
      (r.eventId ? (r.eventId as any).toString?.() : 'deleted-event');

    return {
      id: r._id.toString(),
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      school: r.school,
      position: r.position,
      ticketQuantity: r.ticketQuantity,
      eventId: fallbackEventId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      event: {
        id: fallbackEventId,
        title: populatedEvent?.title ?? 'Deleted Event',
        description: populatedEvent?.description ?? 'This event no longer exists.',
        date: populatedEvent?.date?.toISOString?.() ?? r.createdAt.toISOString(),
        location: populatedEvent?.location ?? 'N/A',
        maxSeats: populatedEvent?.maxSeats ?? 0,
        program: populatedEvent?.program ?? 'N/A',
      },
    };
  });

  const totalTickets = registrationsForClient.reduce((sum, r) => sum + r.ticketQuantity, 0);
  const schoolCount = new Set(registrationsForClient.map((r) => r.school)).size;

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="24" s={{ paddingX: '16' }}>
      <Column maxWidth="xl" gap="32">
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Column gap="4">
            <Text variant="label-default-s" onBackground="brand-medium">
              District 79 Arts Grant Events
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Admin dashboard
            </Heading>
          </Column>
          <Row gap="8" vertical="center">
            <ThemeSwitcher />
            <LogoutButton />
          </Row>
        </Row>

        <Grid columns="4" gap="12" m={{ columns: 2 }}>
          <StatCard icon="calendar" label="Active events" value={activeEventCount} />
          <StatCard icon="document" label="Registrations" value={registrationsForClient.length} />
          <StatCard icon="ticket" label="Tickets reserved" value={totalTickets} />
          <StatCard icon="organization" label="Schools registered" value={schoolCount} />
        </Grid>

        <DashboardTabs
          eventsContent={<EventsManager />}
          registrationsContent={<RegistrationsTable registrations={registrationsForClient} />}
          settingsContent={<SettingsTab />}
        />
      </Column>
    </Column>
  );
}
