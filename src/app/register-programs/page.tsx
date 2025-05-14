import { prisma } from '@/lib/prisma';
import NoAdultEdRegistrationForm from '../register/NoAdultEdRegistrationForm';
import { Event } from '@prisma/client';

interface EventWithAvailable extends Event {
  availableTickets: number;
}

async function getNoAdultEdEvents(): Promise<EventWithAvailable[]> {
  const events = await prisma.event.findMany({
    where: {
      program: 'No-AdultEd',
      date: { gte: new Date() }
    },
    orderBy: { date: 'asc' }
  });

  // For each event, calculate available tickets
  const eventsWithAvailable = await Promise.all(events.map(async (event) => {
    const agg = await prisma.eventsRegistration.aggregate({
      where: { eventId: event.id },
      _sum: { ticketQuantity: true }
    });
    const taken = agg._sum.ticketQuantity || 0;
    return { ...event, availableTickets: event.maxSeats - taken };
  }));

  // Only return events with available tickets > 0
  return eventsWithAvailable.filter(e => e.availableTickets > 0);
}

export default async function RegisterNoAdultEdPage() {
  const events = await getNoAdultEdEvents();
  return <NoAdultEdRegistrationForm events={events} />;
}

export const dynamic = 'force-dynamic'; 