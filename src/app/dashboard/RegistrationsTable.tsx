'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Input,
  Row,
  Select,
  Table,
  Text,
  useToast,
} from '@once-ui-system/core';
import { formatNyDateTimeTable } from '@/lib/nyDatetime';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  position: string;
  ticketQuantity: number;
  createdAt: string;
  event: {
    title: string;
    date: string;
    location: string;
  };
}

const PAGE_SIZE = 10;
const ALL_EVENTS = '__all__';

// Sorting happens here, not in Table: Table compares the displayed text, which
// puts "10/1/2026" before "9/30/2026" and ignores AM/PM.
type SortKey = 'createdAt-desc' | 'createdAt-asc' | 'date-asc' | 'date-desc' | 'event' | 'name' | 'email' | 'tickets';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'createdAt-desc', label: 'Newest registrations' },
  { value: 'createdAt-asc', label: 'Oldest registrations' },
  { value: 'date-asc', label: 'Event date (soonest)' },
  { value: 'date-desc', label: 'Event date (latest)' },
  { value: 'event', label: 'Event name (A–Z)' },
  { value: 'name', label: 'Last name (A–Z)' },
  { value: 'email', label: 'Email (A–Z)' },
  { value: 'tickets', label: 'Most tickets' },
];

function compare(a: Registration, b: Registration, sortBy: SortKey): number {
  const time = (s: string) => new Date(s).getTime();
  switch (sortBy) {
    case 'createdAt-asc':
      return time(a.createdAt) - time(b.createdAt);
    case 'date-asc':
      return time(a.event.date) - time(b.event.date);
    case 'date-desc':
      return time(b.event.date) - time(a.event.date);
    case 'event':
      return a.event.title.localeCompare(b.event.title);
    case 'name':
      return (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName);
    case 'email':
      return a.email.localeCompare(b.email);
    case 'tickets':
      return b.ticketQuantity - a.ticketQuantity;
    case 'createdAt-desc':
    default:
      return time(b.createdAt) - time(a.createdAt);
  }
}

function toCsv(rows: Registration[]): string {
  const csvHeaders = [
    'Event', 'Date', 'Location', 'First Name', 'Last Name', 'Email', 'School', 'Position', 'Tickets', 'Registered At'
  ];
  const csvRows = rows.map(r => [
    r.event.title,
    formatNyDateTimeTable(r.event.date),
    r.event.location,
    r.firstName,
    r.lastName,
    r.email,
    r.school,
    r.position,
    r.ticketQuantity,
    formatNyDateTimeTable(r.createdAt),
  ]);
  return [csvHeaders, ...csvRows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export default function RegistrationsTable({ registrations: initialRegistrations }: { registrations: Registration[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [eventFilter, setEventFilter] = useState(ALL_EVENTS);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('createdAt-desc');
  const [pendingDelete, setPendingDelete] = useState<Registration | null>(null);
  const [deleting, setDeleting] = useState(false);

  const eventOptions = useMemo(() => {
    const titles = Array.from(new Set(registrations.map(r => r.event.title))).sort();
    return [
      { value: ALL_EVENTS, label: 'All events' },
      ...titles.map(title => ({ value: title, label: title })),
    ];
  }, [registrations]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations
      .filter(r => eventFilter === ALL_EVENTS || r.event.title === eventFilter)
      .filter(r =>
        !q ||
        [r.firstName, r.lastName, r.email, r.school, r.position, r.event.title]
          .some(field => field.toLowerCase().includes(q))
      )
      .sort((a, b) => compare(a, b, sortBy));
  }, [registrations, eventFilter, query, sortBy]);

  const isFiltered = eventFilter !== ALL_EVENTS || query.trim() !== '';
  const visibleTickets = visible.reduce((sum, r) => sum + r.ticketQuantity, 0);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(visible)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setEventFilter(ALL_EVENTS);
    setQuery('');
  };

  // Delete handler
  const handleDelete = async (registration: Registration) => {
    const name = `${registration.firstName} ${registration.lastName}`;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/registrations/${registration.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state immediately for better UX
        setRegistrations(prev => prev.filter(r => r.id !== registration.id));
        addToast({ variant: 'success', message: `Registration for ${name} deleted` });
        // Refresh the page to sync with server
        setTimeout(() => router.refresh(), 500);
      } else {
        const data = await response.json();
        addToast({ variant: 'danger', message: data.message || 'Failed to delete registration' });
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      addToast({ variant: 'danger', message: 'An error occurred while deleting the registration' });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <Column gap="20">
      <Row horizontal="between" vertical="end" gap="16" s={{ direction: 'column', horizontal: 'start' }}>
        <Column gap="4">
          <Heading as="h2" variant="heading-strong-l">
            Registrations
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {isFiltered
              ? `${visible.length} of ${registrations.length} registrations · ${visibleTickets} tickets`
              : `${registrations.length} registrations · ${visibleTickets} tickets`}
          </Text>
        </Column>
        <Button prefixIcon="download" variant="secondary" onClick={downloadCsv} disabled={visible.length === 0}>
          {isFiltered ? `Export ${visible.length} to CSV` : 'Export CSV'}
        </Button>
      </Row>

      <Row gap="12" fillWidth vertical="center" m={{ direction: 'column', vertical: 'stretch' }}>
        <Row fillWidth>
          <Input
            id="registrations-search"
            label="Search registrations"
            placeholder="Search name, email, school…"
            size="xs"
            prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
            suffix={query ? (
              <IconButton icon="close" variant="ghost" size="s" tooltip="Clear search" ariaLabel="Clear search" onClick={() => setQuery('')} />
            ) : undefined}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </Row>
        <Row fillWidth>
          <Select
            id="registrations-event"
            label="Event"
            size="xs"
            searchable
            options={eventOptions}
            value={eventFilter}
            onSelect={value => setEventFilter(value as string)}
          />
        </Row>
        <Row fillWidth>
          <Select
            id="registrations-sort"
            label="Sort by"
            size="xs"
            options={SORT_OPTIONS}
            value={sortBy}
            onSelect={value => setSortBy(value as SortKey)}
          />
        </Row>
      </Row>

      <Table
        // Remount on filter change so pagination returns to page 1.
        key={`${eventFilter}|${query}|${sortBy}`}
        paginated
        defaultPageSize={PAGE_SIZE}
        data={{
          headers: [
            { content: 'Registrant', key: 'name' },
            { content: 'Event', key: 'event' },
            { content: 'School', key: 'school', hide: { m: true } },
            { content: 'Tickets', key: 'tickets', align: 'right' },
            { content: 'Registered', key: 'createdAt', hide: { s: true } },
          ],
          rows: visible.map((r) => [
            <Column key="name" gap="2">
              <Text variant="label-strong-s">{r.firstName} {r.lastName}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">{r.email}</Text>
            </Column>,
            <Column key="event" gap="2">
              <Text variant="label-default-s">{r.event.title}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatNyDateTimeTable(r.event.date)} · {r.event.location}
              </Text>
            </Column>,
            <Column key="school" gap="2">
              <Text variant="body-default-s">{r.school}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">{r.position}</Text>
            </Column>,
            r.ticketQuantity,
            formatNyDateTimeTable(r.createdAt),
          ]),
        }}
        actions={[
          {
            icon: 'trash',
            tooltip: 'Delete registration',
            variant: 'danger',
            onClick: (row) => setPendingDelete(visible[row]),
          },
        ]}
        emptyState={
          <Column center gap="12" padding="32">
            <Text variant="body-default-s" onBackground="neutral-weak">
              {isFiltered ? 'No registrations match these filters.' : 'No registrations yet.'}
            </Text>
            {isFiltered && (
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Column>
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        loading={deleting}
        tone="danger"
        title="Delete registration?"
        description={
          pendingDelete
            ? `The registration for ${pendingDelete.firstName} ${pendingDelete.lastName} (${pendingDelete.event.title}, ${pendingDelete.ticketQuantity} tickets) will be removed. This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && handleDelete(pendingDelete)}
      />
    </Column>
  );
}
