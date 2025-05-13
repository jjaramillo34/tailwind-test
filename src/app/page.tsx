import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });
  return events;
}

export default async function HomePage() {
  const events = await getEvents();
  
  return (
    <div className="min-h-screen bg-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        {/* Introduction Section */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
          District 79 Arts Grant Events
        </h1>
        
        <p className="text-gray-700 mb-4 text-center">
          <strong>Good Day,</strong>
        </p>
        
        <p className="text-gray-700 mb-4 text-center">
          We are thrilled to announce that District 79 has been awarded an Arts Grant, which has provided our students with access to elite art experiences throughout New York City. This opportunity will enrich their education and inspire their creativity in meaningful ways.
        </p>
        
        <p className="text-gray-700 mb-4 text-center">
          All District 79 programs have an opportunity to attend any of the events listed below. Tickets will be distributed on a first come - first served basis. <br />
          <strong>Please register your students for Broadway, One World Observation experience, and/or a Belongó performance for your school/program by COB Wednesday, May 14th, 2025.</strong>
        </p>
        
        <div className="mb-8 flex justify-center">
          <Link href="/register" className="inline-block w-full max-w-xs text-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Click here to register
          </Link>
        </div>
        
        {/* Broadway Section */}
        <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2 text-center">
          Broadway
        </h2>
        
        <p className="text-gray-700 mb-2 text-center">
          <strong>Please Note:</strong> Broadway shows do not use a standardized rating system to indicate mature themes. While each of the productions listed below is appropriate for audiences aged 8 and older, please be advised that some shows may contain themes such as magic, monsters, betrayal, and death.
        </p>
        
        <p className="text-gray-700 mb-4 text-center">
          We recognize and respect the diversity of our community. Due to differences in religion, culture, and personal values, some content may be perceived as sensitive or potentially offensive. We encourage educators and guardians to review show descriptions in advance and prepare students accordingly.
        </p>
        
        {/* Divider */}
        <hr className="my-8 border-gray-300" />
        
        {/* Events Section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Filter Broadway Events */}
          {events.filter(event => 
            event.location === 'Broadway' || 
            event.location === 'Lyric Theatre' || 
            event.location === 'Minskoff Theatre'
          ).map(event => (
            <div key={event.id} className="bg-blue-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-blue-800">{event.title}</h3>
              <p className="text-gray-700 font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}</p>
              <p className="text-blue-700 font-semibold mt-1">{event.maxSeats} Tickets Available</p>
              <p className="text-gray-700 mt-3">{event.description}</p>
            </div>
          ))}
        </div>
          
        {/* Divider */}
        <hr className="my-10 border-gray-300" />
        
        {/* Other Events Section */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Other Experiences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Filter Other Events */}
          {events.filter(event => 
            event.location !== 'Broadway' && 
            event.location !== 'Lyric Theatre' && 
            event.location !== 'Minskoff Theatre'
          ).map(event => (
            <div key={event.id} className="bg-blue-50 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-blue-800">{event.title}</h3>
              <p className="text-gray-700 font-medium">{event.location}</p>
              <p className="text-blue-700 font-semibold mt-1">{event.maxSeats} Tickets Available</p>
              <p className="text-gray-700 mt-3">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}