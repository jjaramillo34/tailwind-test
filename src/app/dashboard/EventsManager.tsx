'use client';

import { useState, useEffect } from 'react';
import {
  formatDateForDatetimeLocalEastern,
  formatNyDateTimeTable,
} from '@/lib/nyDatetime';

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

export default function EventsManager() {
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
        resetForm();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
    setShowForm(true);
  };

  const handleToggleActive = async (event: Event) => {
    const next = !event.isActive;
    if (
      !next &&
      !confirm(
        'Deactivate this event? It will be hidden from the public site and new registrations will be blocked.'
      )
    ) {
      return;
    }

    setTogglingId(event.id);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update event');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
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

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Events Management</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + Add New Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <h4 className="font-bold mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h4>
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date & Time * <span className="font-normal text-gray-500">(Eastern — New York)</span>
              </label>
              <input
                type="datetime-local"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the event start time in Eastern Time (EST/EDT). It is stored correctly even if you are not in New York.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Seats *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full border rounded px-3 py-2"
                value={formData.maxSeats}
                onChange={(e) =>
                  setFormData({ ...formData, maxSeats: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Program *
              </label>
              <select
                required
                className="w-full border rounded px-3 py-2"
                value={formData.program}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
              >
                <option value="No-AdultEd">No-AdultEd</option>
                <option value="AdultEd">AdultEd</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                className="w-full border rounded px-3 py-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Max Seats</th>
              <th className="px-4 py-2 text-left">Program</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr
                key={event.id}
                className={event.isActive === false ? 'bg-gray-50 text-gray-600' : ''}
              >
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">
                  {formatNyDateTimeTable(event.date)}
                </td>
                <td className="px-4 py-2">{event.location}</td>
                <td className="px-4 py-2">{event.maxSeats}</td>
                <td className="px-4 py-2">{event.program}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {event.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(event)}
                      disabled={togglingId === event.id}
                      className={`px-3 py-1 rounded text-sm font-medium disabled:opacity-50 ${
                        event.isActive !== false
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-green-100 text-green-900 hover:bg-green-200'
                      }`}
                    >
                      {togglingId === event.id
                        ? '…'
                        : event.isActive !== false
                          ? 'Deactivate'
                          : 'Activate'}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No events found. Create your first event!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
