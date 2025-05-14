import { prisma } from '@/lib/prisma';
import AdultEdRegistrationForm from '../register/AdultEdRegistrationForm';
import { Event } from '@prisma/client';

interface EventWithAvailable extends Event {
  availableTickets: number;
}

async function getAdultEdEvents(): Promise<EventWithAvailable[]> {
  const events = await prisma.event.findMany({
    where: {
      program: 'AdultEd',
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

export default async function RegisterAdultEdPage() {
  const events = await getAdultEdEvents();
  return <AdultEdRegistrationForm events={events} />;
}

export const dynamic = 'force-dynamic'; 