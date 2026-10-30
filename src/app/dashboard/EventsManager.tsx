'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Column,
  Dialog,
  Feedback,
  Grid,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Switch,
  Table,
  Tag,
  Text,
  Textarea,
  useToast,
} from '@once-ui-system/core';
import {
  formatDateForDatetimeLocalEastern,
  formatNyDateTimeTable,
} from '@/lib/nyDatetime';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxSeats: number;
  program: string;
  isActive: boolean;
}

const PROGRAM_OPTIONS = [
  { value: 'No-AdultEd', label: 'Programs (No-AdultEd)' },
  { value: 'AdultEd', label: 'AdultEd' },
];

type PendingAction = { kind: 'delete' | 'deactivate'; event: Event } | null;

export default function EventsManager() {
  const { addToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxSeats: '',
    program: 'No-AdultEd',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(
          data.map((e: Event & { isActive?: boolean }) => ({
            ...e,
            isActive: e.isActive !== false,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxSeats: parseInt(formData.maxSeats),
        }),
      });

      if (response.ok) {
        await fetchEvents();
        addToast({
          variant: 'success',
          message: editingEvent ? `“${formData.title}” updated` : `“${formData.title}” created`,
        });
        resetForm();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: formatDateForDatetimeLocalEastern(event.date),
      location: event.location,
      maxSeats: event.maxSeats.toString(),
      program: event.program,
    });
    setError('');
    setShowForm(true);
  };

  const setActive = async (event: Event, next: boolean) => {
    setTogglingId(event.id);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });

      if (response.ok) {
        await fetchEvents();
        addToast({
          variant: 'success',
          message: `“${event.title}” ${next ? 'activated' : 'deactivated'}`,
        });
      } else {
        const data = await response.json();
        addToast({ variant: 'danger', message: data.message || 'Failed to update event' });
      }
    } catch {
      addToast({ variant: 'danger', message: 'An error occurred. Please try again.' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleActive = (event: Event) => {
    // Deactivating hides the event publicly, so confirm first; activating is safe.
    if (event.isActive) {
      setPending({ kind: 'deactivate', event });
    } else {
      setActive(event, true);
    }
  };

  const handleDelete = async (event: Event) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
        addToast({ variant: 'success', message: `“${event.title}” deleted` });
      } else {
        addToast({ variant: 'danger', message: 'Failed to delete event' });
      }
    } catch (err) {
      addToast({ variant: 'danger', message: 'An error occurred. Please try again.' });
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    setConfirming(true);
    if (pending.kind === 'delete') {
      await handleDelete(pending.event);
    } else {
      await setActive(pending.event, false);
    }
    setConfirming(false);
    setPending(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      maxSeats: '',
      program: 'No-AdultEd',
    });
    setEditingEvent(null);
    setShowForm(false);
    setError('');
  };

  return (
    <Column gap="24">
      <Row horizontal="between" vertical="end" gap="16" s={{ direction: 'column', horizontal: 'start' }}>
        <Column gap="4">
          <Heading as="h2" variant="heading-strong-l">
            Events
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Inactive events are hidden from the public site and closed to new registrations.
          </Text>
        </Column>
        <Button
          prefixIcon="plus"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add event
        </Button>
      </Row>

      <Table
        loading={loading}
        data={{
          headers: [
            { content: 'Title', key: 'title' },
            { content: 'Date', key: 'date' },
            { content: 'Location', key: 'location', hide: { m: true } },
            { content: 'Seats', key: 'seats', align: 'right' },
            { content: 'Program', key: 'program', hide: { s: true } },
            { content: 'Status', key: 'status' },
          ],
          rows: events.map((event) => [
            <Text key="title" variant="label-strong-s">{event.title}</Text>,
            formatNyDateTimeTable(event.date),
            event.location,
            event.maxSeats,
            <Tag key="program" size="s" scheme={event.program === 'AdultEd' ? 'accent' : 'brand'}>
              {event.program}
            </Tag>,
            <Row key="status" gap="12" vertical="center">
              <Switch
                checked={event.isActive}
                loading={togglingId === event.id}
                disabled={togglingId === event.id}
                ariaLabel={`${event.isActive ? 'Deactivate' : 'Activate'} ${event.title}`}
                onToggle={() => handleToggleActive(event)}
              />
              <Tag size="s" scheme={event.isActive ? 'success' : 'neutral'}>
                {event.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Row>,
          ]),
        }}
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit event',
            onClick: (row) => handleEdit(events[row]),
          },
          {
            icon: 'trash',
            tooltip: 'Delete event',
            variant: 'danger',
            onClick: (row) => setPending({ kind: 'delete', event: events[row] }),
          },
        ]}
        emptyState={
          <Column center gap="12" padding="32">
            <Text variant="body-default-s" onBackground="neutral-weak">
              No events yet.
            </Text>
            <Button size="s" variant="secondary" prefixIcon="plus" onClick={() => setShowForm(true)}>
              Create your first event
            </Button>
          </Column>
        }
      />

      <Dialog
        open={showForm}
        onClose={resetForm}
        title={editingEvent ? 'Edit event' : 'Create event'}
        description={editingEvent ? editingEvent.title : 'Add a new event to the public listing.'}
      >
        <form onSubmit={handleSubmit}>
          <Column gap="16" paddingTop="8">
            <Input
              id="event-title"
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Grid columns="2" gap="16" s={{ columns: 1 }}>
              <Input
                id="event-date"
                type="datetime-local"
                label="Date & time (Eastern)"
                // A placeholder keeps the label floated above the browser's date mask.
                placeholder=" "
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                description="Stored as New York time, wherever you are."
              />
              <Input
                id="event-seats"
                type="number"
                label="Max seats"
                min={1}
                required
                value={formData.maxSeats}
                onChange={(e) => setFormData({ ...formData, maxSeats: e.target.value })}
              />
            </Grid>
            <Input
              id="event-location"
              label="Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Column gap="8">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Program
              </Text>
              <SegmentedControl
                fillWidth={false}
                semantics="radio"
                value={formData.program}
                onChange={(value) => setFormData({ ...formData, program: value })}
                buttons={PROGRAM_OPTIONS}
              />
            </Column>
            <Textarea
              id="event-description"
              label="Description"
              lines={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {error && <Feedback variant="danger" description={error} />}
            <Row horizontal="end" gap="8" paddingTop="8">
              <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingEvent ? 'Save changes' : 'Create event'}
              </Button>
            </Row>
          </Column>
        </form>
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        loading={confirming}
        tone={pending?.kind === 'delete' ? 'danger' : 'primary'}
        title={pending?.kind === 'delete' ? 'Delete event?' : 'Deactivate event?'}
        description={
          pending?.kind === 'delete'
            ? `“${pending.event.title}” will be permanently deleted.`
            : `“${pending?.event.title}” will be hidden from the public site and new registrations will be blocked.`
        }
        confirmLabel={pending?.kind === 'delete' ? 'Delete' : 'Deactivate'}
        onConfirm={confirmPending}
      />
    </Column>
  );
}
