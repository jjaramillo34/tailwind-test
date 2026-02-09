'use client';
import React, { useState, useMemo } from 'react';
import { Trash2, Download, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function RegistrationsTable({ registrations: initialRegistrations }: { registrations: Registration[] }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchEvent, setSearchEvent] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'event' | 'email' | 'date' | 'name' | 'tickets' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Delete handler
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the registration for ${name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state immediately for better UX
        setRegistrations(prev => prev.filter(r => r.id !== id));
        // Refresh the page to sync with server
        setTimeout(() => router.refresh(), 500);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete registration');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('An error occurred while deleting the registration');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 gap-2">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by event title..."
            value={searchEvent}
            onChange={e => { setSearchEvent(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 pl-10 w-full"
          />
          {searchEvent && (
            <button
              onClick={() => setSearchEvent('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by email..."
            value={searchEmail}
            onChange={e => { setSearchEmail(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 pl-10 w-full"
          />
          {searchEmail && (
            <button
              onClick={() => setSearchEmail('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mt-2 md:mt-0 flex items-center gap-2"
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
          <Download className="h-4 w-4" />
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg w-full border border-gray-200">
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('event')}>
                <div className="flex items-center">
                  Event {sortBy === 'event' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Date {sortBy === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('email')}>
                <div className="flex items-center">
                  Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">School</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('tickets')}>
                <div className="flex items-center">
                  Tickets {sortBy === 'tickets' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center">
                  Registered At {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{r.event.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.event.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.event.location}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.school}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.position}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.ticketQuantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(r.id, `${r.firstName} ${r.lastName}`)}
                    disabled={deletingId === r.id}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-200"
                    title="Delete registration"
                  >
                    {deletingId === r.id ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">No registrations found.</td>
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