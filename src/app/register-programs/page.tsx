import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import NoAdultEdRegistrationForm from '../register/NoAdultEdRegistrationForm';
import { IEvent } from '@/lib/models/Event';
import { Types } from 'mongoose';

interface EventWithAvailable extends IEvent {
  availableTickets: number;
}

async function getNoAdultEdEvents(): Promise<EventWithAvailable[]> {
  await connectDB();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const events = await Event.find({
    program: 'No-AdultEd',
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

export default async function RegisterNoAdultEdPage() {
  const events = await getNoAdultEdEvents();
  return <NoAdultEdRegistrationForm events={events} />;
}

export const dynamic = 'force-dynamic'; 