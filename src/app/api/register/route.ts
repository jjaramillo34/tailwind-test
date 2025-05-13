import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  console.log('Registration API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { firstName, lastName, email, school, position, eventId, ticketQuantity } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !school || !position || !eventId || !ticketQuantity) {
      console.log('Missing required fields:', { firstName, lastName, email, school, position, eventId, ticketQuantity });
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith('@schools.nyc.gov')) {
      console.log('Invalid email domain:', email);
      return NextResponse.json(
        { message: 'Invalid email domain. Must be @schools.nyc.gov' },
        { status: 400 }
      );
    }

    // Validate ticket quantity
    const requestedTickets = parseInt(ticketQuantity);
    if (isNaN(requestedTickets) || requestedTickets < 1) {
      console.log('Invalid ticket quantity:', ticketQuantity);
      return NextResponse.json(
        { message: 'Invalid ticket quantity' },
        { status: 400 }
      );
    }
    if (requestedTickets > 10) {
      return NextResponse.json(
        { message: 'You can request a maximum of 10 tickets per registration' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });
    console.log('Found event:', event);
    if (!event) {
      console.log('Event not found:', eventId);
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Calculate available seats based on sum of ticketQuantity for all registrations
    const totalTicketsTaken = await prisma.eventsRegistration.aggregate({
      where: { eventId: parseInt(eventId) },
      _sum: { ticketQuantity: true }
    });
    const ticketsTaken = totalTicketsTaken._sum.ticketQuantity || 0;
    const availableSeats = event.maxSeats - ticketsTaken;
    console.log('Available seats:', availableSeats);

    if (requestedTickets > availableSeats) {
      console.log('Insufficient tickets:', { requested: requestedTickets, available: availableSeats });
      return NextResponse.json(
        { message: `Only ${availableSeats} tickets available for this event` },
        { status: 400 }
      );
    }

    // Check if user has already registered for this event
    const existingRegistration = await prisma.eventsRegistration.findUnique({
      where: {
        email_eventId: {
          email,
          eventId: parseInt(eventId)
        }
      }
    });

    if (existingRegistration) {
      console.log('Duplicate registration found:', existingRegistration);
      return NextResponse.json(
        { message: 'You have already registered for this event' },
        { status: 400 }
      );
    }

    // Create registration with ticket quantity
    const registration = await prisma.eventsRegistration.create({
      data: {
        firstName,
        lastName,
        email,
        school,
        position,
        eventId: parseInt(eventId),
        ticketQuantity: requestedTickets
      },
    });

    console.log('Created registration:', registration);

    return NextResponse.json({
      ...registration,
      success: true,
      redirectUrl: `/registration-success?id=${registration.id}`
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 