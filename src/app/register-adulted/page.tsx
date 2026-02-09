import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import AdultEdRegistrationForm from '../register/AdultEdRegistrationForm';

/** Plain object type for events with available ticket count (no Mongoose Document methods). */
interface EventWithAvailable {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSeats: number;
  program: string;
  createdAt: Date;
  updatedAt: Date;
  availableTickets: number;
}

async function getAdultEdEvents(): Promise<EventWithAvailable[]> {
  await connectDB();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const events = await Event.find({
    program: 'AdultEd',
    date: { $gte: new Date() },
    createdAt: { $gte: thirtyDaysAgo }
  }).sort({ date: 'asc' });

  // For each event, calculate available tickets
  const eventsWithAvailable = await Promise.all(events.map(async (event) => {
    const registrations = await EventsRegistration.find({ eventId: event._id });
    const taken = registrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
    const eventObj = event.toObject();
    return { 
      ...eventObj, 
      _id: eventObj._id.toString(),
      availableTickets: event.maxSeats - taken 
    };
  }));

  // Only return events with available tickets > 0
  return eventsWithAvailable.filter(e => e.availableTickets > 0);
}

export default async function RegisterAdultEdPage() {
  const events = await getAdultEdEvents();
  return <AdultEdRegistrationForm events={events} />;
}

export const dynamic = 'force-dynamic'; 