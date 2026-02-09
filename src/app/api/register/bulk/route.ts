import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import { Types } from 'mongoose';

interface RegistrationItem {
  eventId: string;
  ticketQuantity: number;
}

export async function POST(request: Request) {
  console.log('Bulk Registration API called');
  
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { firstName, lastName, email, school, position, registrations } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !school || !position || !registrations || !Array.isArray(registrations) || registrations.length === 0) {
      return NextResponse.json(
        { message: 'All fields are required and at least one event must be selected' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith('@schools.nyc.gov')) {
      return NextResponse.json(
        { message: 'Invalid email domain. Must be @schools.nyc.gov' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: string[] = [];

    // Process each registration
    for (const reg of registrations as RegistrationItem[]) {
      const { eventId, ticketQuantity } = reg;

      try {
        // Validate eventId
        if (!Types.ObjectId.isValid(eventId)) {
          errors.push(`Invalid event ID: ${eventId}`);
          continue;
        }

        // Validate ticket quantity
        const requestedTickets = parseInt(ticketQuantity.toString());
        if (isNaN(requestedTickets) || requestedTickets < 1) {
          errors.push(`Invalid ticket quantity for event ${eventId}`);
          continue;
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
          errors.push(`Event not found: ${eventId}`);
          continue;
        }

        // Check total tickets for this user across all their registrations for this event
        const allUserRegistrations = await EventsRegistration.find({
          email,
          eventId: new Types.ObjectId(eventId)
        });
        
        const totalTicketsForUser = allUserRegistrations.reduce(
          (sum, reg) => sum + reg.ticketQuantity, 
          0
        );

        // Check if user has already registered for this event
        const existingRegistration = await EventsRegistration.findOne({
          email,
          eventId: new Types.ObjectId(eventId)
        });

        // Check school limit: total tickets for this school for this event cannot exceed 10
        const schoolRegistrations = await EventsRegistration.find({
          school,
          eventId: new Types.ObjectId(eventId)
        });
        const totalTicketsForSchool = schoolRegistrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
        
        // Calculate how many tickets the school would have after this registration
        let schoolTicketsAfterRegistration = totalTicketsForSchool;
        if (existingRegistration) {
          // If updating existing registration, subtract current quantity and add new total
          schoolTicketsAfterRegistration = totalTicketsForSchool - existingRegistration.ticketQuantity + (totalTicketsForUser + requestedTickets);
        } else {
          // If new registration, just add requested tickets
          schoolTicketsAfterRegistration = totalTicketsForSchool + requestedTickets;
        }

        if (schoolTicketsAfterRegistration > 10) {
          errors.push(`${event.title}: Your school has already registered for ${totalTicketsForSchool} ticket${totalTicketsForSchool !== 1 ? 's' : ''} for this event. Maximum 10 tickets per school per event.`);
          continue;
        }

        if (existingRegistration) {
          // User already registered - check if adding more tickets would exceed 10 per user
          if (totalTicketsForUser + requestedTickets > 10) {
            errors.push(`${event.title}: You already have ${totalTicketsForUser} ticket${totalTicketsForUser !== 1 ? 's' : ''}. Maximum 10 tickets total per event.`);
            continue;
          }

          // Update existing registration
          existingRegistration.ticketQuantity += requestedTickets;
          await existingRegistration.save();
          
          results.push({
            eventId: eventId,
            eventTitle: event.title,
            ticketQuantity: existingRegistration.ticketQuantity,
            action: 'updated'
          });
          continue;
        }

        // New registration - check if total would exceed 10 per user
        if (totalTicketsForUser + requestedTickets > 10) {
          errors.push(`${event.title}: Maximum 10 tickets total per event. You already have ${totalTicketsForUser} ticket${totalTicketsForUser !== 1 ? 's' : ''}.`);
          continue;
        }

        // Check available seats
        const allRegistrations = await EventsRegistration.find({ 
          eventId: new Types.ObjectId(eventId) 
        });
        const ticketsTaken = allRegistrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
        const availableSeats = event.maxSeats - ticketsTaken;

        if (requestedTickets > availableSeats) {
          errors.push(`${event.title}: Only ${availableSeats} tickets available`);
          continue;
        }

        if (requestedTickets > 10) {
          errors.push(`${event.title}: Maximum 10 tickets per registration`);
          continue;
        }

        // Create new registration
        const registration = await EventsRegistration.create({
          firstName,
          lastName,
          email,
          school,
          position,
          eventId: new Types.ObjectId(eventId),
          ticketQuantity: requestedTickets
        });

        results.push({
          eventId: eventId,
          eventTitle: event.title,
          ticketQuantity: requestedTickets,
          registrationId: registration._id.toString(),
          action: 'created'
        });

      } catch (error) {
        console.error(`Error processing registration for event ${eventId}:`, error);
        errors.push(`Error registering for event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          message: 'Registration failed',
          errors: errors
        },
        { status: 400 }
      );
    }

    // Return first registration ID for redirect (or create a summary page)
    const firstRegistrationId = results[0]?.registrationId || null;

    return NextResponse.json({
      success: true,
      results: results,
      errors: errors.length > 0 ? errors : undefined,
      redirectUrl: firstRegistrationId 
        ? `/registration-success?id=${firstRegistrationId}&bulk=true&count=${results.length}`
        : `/registration-success?bulk=true&count=${results.length}`
    });

  } catch (error) {
    console.error('Bulk registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
