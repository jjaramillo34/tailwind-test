import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  console.log('Registration API called');
  
  try {
    await connectDB();
    
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

    // Validate eventId is a valid ObjectId
    if (!Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    console.log('Found event:', event);
    if (!event) {
      console.log('Event not found:', eventId);
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Calculate available seats based on sum of ticketQuantity for all registrations
    const registrations = await EventsRegistration.find({ eventId: new Types.ObjectId(eventId) });
    const ticketsTaken = registrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
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
    const existingRegistration = await EventsRegistration.findOne({
      email,
      eventId: new Types.ObjectId(eventId)
    });

    if (existingRegistration) {
      console.log('Duplicate registration found:', existingRegistration);
      return NextResponse.json(
        { message: 'You have already registered for this event' },
        { status: 400 }
      );
    }

    // Check school limit: total tickets for this school for this event cannot exceed 10
    const schoolRegistrations = await EventsRegistration.find({
      school,
      eventId: new Types.ObjectId(eventId)
    });
    const totalTicketsForSchool = schoolRegistrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
    
    if (totalTicketsForSchool + requestedTickets > 10) {
      console.log('School ticket limit exceeded:', { school, totalTicketsForSchool, requestedTickets });
      return NextResponse.json(
        { message: `Your school has already registered for ${totalTicketsForSchool} ticket${totalTicketsForSchool !== 1 ? 's' : ''} for this event. Maximum 10 tickets per school per event.` },
        { status: 400 }
      );
    }

    // Create registration with ticket quantity
    const registration = await EventsRegistration.create({
      firstName,
      lastName,
      email,
      school,
      position,
      eventId: new Types.ObjectId(eventId),
      ticketQuantity: requestedTickets
    });

    console.log('Created registration:', registration);

    return NextResponse.json({
      id: registration._id.toString(),
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      school: registration.school,
      position: registration.position,
      ticketQuantity: registration.ticketQuantity,
      eventId: registration.eventId.toString(),
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      success: true,
      redirectUrl: `/registration-success?id=${registration._id.toString()}`
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 