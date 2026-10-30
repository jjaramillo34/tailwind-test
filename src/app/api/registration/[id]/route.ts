import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EventsRegistration from '@/lib/models/EventsRegistration';
import { Types } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid registration ID' },
        { status: 400 }
      );
    }

    const registration = await EventsRegistration.findById(id).populate('eventId');

    if (!registration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    const event = registration.eventId as any;

    return NextResponse.json({
      id: registration._id.toString(),
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      school: registration.school,
      position: registration.position,
      ticketQuantity: registration.ticketQuantity,
      eventId: event._id.toString(),
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
      event: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        maxSeats: event.maxSeats,
        program: event.program,
      }
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { message: 'Error fetching registration details' },
      { status: 500 }
    );
  }
} 