'use client';
import React, { useState, useMemo } from 'react';

interface Registration {
  id: number;
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

export default function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
  const [searchEvent, setSearchEvent] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'event' | 'email' | 'date' | 'name' | 'tickets' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const csvHeaders = [
    'Event', 'Date', 'Location', 'First Name', 'Last Name', 'Email', 'School', 'Position', 'Tickets', 'Registered At'
  ];
  const csvRows = registrations.map(r => [
    r.event.title,
    new Date(r.event.date).toLocaleDateString(),
    r.event.location,
    r.firstName,
    r.lastName,
    r.email,
    r.school,
    r.position,
    r.ticketQuantity,
    new Date(r.createdAt).toLocaleString()
  ]);
  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Filtering
  const filtered = useMemo(() => {
    return registrations.filter(r =>
      r.event.title.toLowerCase().includes(searchEvent.toLowerCase()) &&
      r.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
  }, [registrations, searchEvent, searchEmail]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'event':
          aValue = a.event.title.toLowerCase();
          bValue = b.event.title.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.event.date).getTime();
          bValue = new Date(b.event.date).getTime();
          break;
        case 'name':
          aValue = a.lastName.toLowerCase() + a.firstName.toLowerCase();
          bValue = b.lastName.toLowerCase() + b.firstName.toLowerCase();
          break;
        case 'tickets':
          aValue = a.ticketQuantity;
          bValue = b.ticketQuantity;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Sorting handler
  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 gap-2">
        <input
          type="text"
          placeholder="Filter by event title..."
          value={searchEvent}
          onChange={e => { setSearchEvent(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <input
          type="text"
          placeholder="Filter by email..."
          value={searchEmail}
          onChange={e => { setSearchEmail(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mt-2 md:mt-0"
          onClick={() => {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'registrations.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow w-full">
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('event')}>
                Event {sortBy === 'event' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
                Date {sortBy === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2">School</th>
              <th className="px-4 py-2">Position</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('tickets')}>
                Tickets {sortBy === 'tickets' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('createdAt')}>
                Registered At {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 whitespace-nowrap">{r.event.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.event.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.event.location}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.school}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.position}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.ticketQuantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">No registrations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages || 1}
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
} 