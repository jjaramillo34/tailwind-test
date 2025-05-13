import Link from 'next/link';

const adultEdEvents = [
  {
    title: 'Hells Kitchen (Evening)',
    date: 'June 4th',
    time: '7:30 p.m.',
    tickets: 46,
    program: 'AdultEd',
  },
  {
    title: 'Group Trip (Evening)',
    date: 'June 13th',
    time: '6:00 p.m.',
    tickets: 75,
    program: 'AdultEd',
  },
  {
    title: 'Death Becomes Her (Evening)',
    date: 'May 21st',
    time: '7:30 p.m.',
    tickets: 55,
    program: 'AdultEd',
  },
];

export default function AdultEdLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <img src="/images/d79logo.png" alt="District 79 Logo" className="mx-auto mb-6 h-16 w-auto" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome to AdultEd Event Registration!</h1>
        <p className="mb-6 text-gray-700">
          District 79 Adult Education events are special opportunities for our community to experience Broadway and cultural events together.<br />
          Please review the available events below and click the button to register. Tickets are limited and available on a first-come, first-served basis.
        </p>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {adultEdEvents.map(event => (
            <div key={event.title} className="bg-white border-l-4 border-blue-500 rounded-xl shadow p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h2>
              <div className="text-gray-700 mb-1">{event.date} &middot; {event.time}</div>
              <div className="text-gray-800 font-semibold mb-2">Tickets: {event.tickets}</div>
              <div className="text-xs text-gray-500">AdultEd Broadway Event</div>
            </div>
          ))}
        </div>
        <Link href="/register-adulted" className="inline-block w-full py-3 px-6 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-indigo-700 transition">Register for an AdultEd Event</Link>
      </div>
    </div>
  );
} 