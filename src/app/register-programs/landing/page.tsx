import Link from 'next/link';

const programsEvents = [
  {
    title: 'MJ The Musical',
    date: 'June 11th',
    time: '2:00 p.m.',
    tickets: 66,
    program: 'No-AdultEd',
  },
  {
    title: 'Harry Potter',
    date: 'May 28th',
    time: '2:00 p.m.',
    tickets: 36,
    program: 'No-AdultEd',
  },
  {
    title: 'Stranger Things',
    date: 'June 4th',
    time: '2:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'One World Observatory',
    date: 'June 13th',
    time: '11:00 a.m. - 1:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'One World Observatory',
    date: 'June 13th',
    time: '1:00 p.m. - 3:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'Lion King',
    date: 'May 21st',
    time: '2:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
];

export default function ProgramsLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <img src="/images/d79logo.png" alt="District 79 Logo" className="mx-auto mb-6 h-16 w-auto" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome to Programs Event Registration!</h1>
        <p className="mb-6 text-gray-700">
          District 79 Programs events are special opportunities for our community to experience Broadway and cultural events together.<br />
          Please review the available events below and click the button to register. Tickets are limited and available on a first-come, first-served basis.
        </p>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {programsEvents.map(event => (
            <div key={event.title + event.time} className="bg-white border-l-4 border-blue-500 rounded-xl shadow p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h2>
              <div className="text-gray-700 mb-1">{event.date} &middot; {event.time}</div>
              <div className="text-gray-800 font-semibold mb-2">Tickets: {event.tickets}</div>
              <div className="text-xs text-gray-500">No-AdultEd Broadway Event</div>
            </div>
          ))}
        </div>
        <Link href="/register-programs" className="inline-block w-full py-3 px-6 bg-indigo-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-indigo-700 transition">Register for a Programs Event</Link>
      </div>
    </div>
  );
} 