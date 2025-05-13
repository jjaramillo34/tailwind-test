'use client';
import React from 'react';

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

export default function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
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

  return (
    <>
      <button
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {csvHeaders.map(h => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 whitespace-nowrap">{r.event.title}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.event.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.event.location}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.firstName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.lastName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.school}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.position}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.ticketQuantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
} 