import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';

interface EventWithAvailable {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSeats: number;
  program: string;
  availableTickets: number;
}

async function getEvents(): Promise<EventWithAvailable[]> {
  await connectDB();
  const events = await Event.find({}).sort({ date: 'asc' });
  
  // Calculate available tickets for each event
  const eventsWithAvailable = await Promise.all(events.map(async (event) => {
    const registrations = await EventsRegistration.find({ eventId: event._id });
    const ticketsTaken = registrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
    const availableTickets = event.maxSeats - ticketsTaken;
    
    const eventObj = event.toObject();
    return {
      ...eventObj,
      _id: eventObj._id.toString(),
      availableTickets
    };
  }));
  
  // Filter out events with no available tickets
  return eventsWithAvailable.filter(e => e.availableTickets > 0);
}

export default async function HomePage() {
  const events = await getEvents();
  
  const broadwayEvents = events.filter(event => 
    event.location.includes('Broadway') || 
    event.location.includes('Theatre') ||
    event.location.includes('Gershwin') ||
    event.location.includes('226 West 46th')
  );
  
  const experienceEvents = events.filter(event => 
    !event.location.includes('Broadway') && 
    !event.location.includes('Theatre') &&
    !event.location.includes('Gershwin') &&
    !event.location.includes('226 West 46th')
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              District 79 Arts Grant Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Enriching education through elite art experiences throughout New York City
            </p>
            <Link 
              href="/register-programs" 
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 text-lg"
            >
              Register Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg mb-4">
              <strong className="text-blue-600">Good Day,</strong>
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We are thrilled to announce that District 79 has been awarded an Arts Grant, which has provided our students with access to elite art experiences throughout New York City. This opportunity will enrich their education and inspire their creativity in meaningful ways.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
              <p className="text-gray-800 mb-2">
                <strong>Registration Information:</strong>
              </p>
              <p className="text-gray-700">
                All District 79 programs have an opportunity to attend any of the events listed below. Tickets will be distributed on a <strong>first come - first served basis</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Broadway Section */}
        {broadwayEvents.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-100 rounded-full px-4 py-2 mb-4">
                <span className="text-blue-600 font-semibold">🎭 BROADWAY SHOWS</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Broadway Productions</h2>
              <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <p className="text-gray-800 mb-2">
                  <strong className="text-amber-800">Please Note:</strong>
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Broadway shows do not use a standardized rating system to indicate mature themes. While each of the productions listed below is appropriate for audiences aged 8 and older, please be advised that some shows may contain themes such as magic, monsters, betrayal, and death. We recognize and respect the diversity of our community. Due to differences in religion, culture, and personal values, some content may be perceived as sensitive or potentially offensive. We encourage educators and guardians to review show descriptions in advance and prepare students accordingly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {broadwayEvents.map(event => (
                <div 
                  key={event._id.toString()} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                      {event.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="text-blue-600 mr-2">📅</span>
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="text-blue-600 mr-2">🕐</span>
                      <span className="font-medium">
                        {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <span className="text-blue-600 mr-2">📍</span>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-blue-700 font-bold text-lg">
                        {event.availableTickets} Tickets Available
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Events Section */}
        {experienceEvents.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 rounded-full px-4 py-2 mb-4">
                <span className="text-indigo-600 font-semibold">🎨 CULTURAL EXPERIENCES</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Other Experiences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experienceEvents.map(event => (
                <div 
                  key={event._id.toString()} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-100 transition-colors">
                      {event.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="text-indigo-600 mr-2">📅</span>
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) !== 'Invalid Date' && (
                      <div className="flex items-center text-gray-600 mb-3">
                        <span className="text-indigo-600 mr-2">🕐</span>
                        <span className="font-medium">
                          {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 mb-4">
                      <span className="text-indigo-600 mr-2">📍</span>
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                      <p className="text-indigo-700 font-bold text-lg">
                        {event.availableTickets} Tickets Available
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-12 text-center text-white mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Register?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't miss out on these incredible opportunities for your students. Register now to secure your tickets!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register-programs" 
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
            >
              Register for Programs
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">District 79</h3>
              <p className="text-sm text-gray-400">
                Providing exceptional educational experiences through arts and cultural programs in New York City.
              </p>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Questions?</h3>
              <p className="text-sm text-gray-400 mb-3">
                For questions about events and registration, please contact:
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-white">Nyesha Green</p>
                  <a 
                    href="mailto:NGreene4@schools.nyc.gov" 
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    NGreene4@schools.nyc.gov
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Javier Jaramillo</p>
                  <a 
                    href="mailto:jjaramillo7@schools.nyc.gov" 
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    jjaramillo7@schools.nyc.gov
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link 
                  href="/register-programs" 
                  className="block text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Register for Programs
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} District 79 Arts Grant Events. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
