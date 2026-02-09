import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { isAdminAuthenticated } from '@/lib/auth';
import { Types } from 'mongoose';

// GET all events
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const events = await Event.find({}).sort({ date: 'asc' });

    return NextResponse.json(
      events.map(event => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        maxSeats: event.maxSeats,
        program: event.program,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Error fetching events' },
      { status: 500 }
    );
  }
}

// POST create new event
export async function POST(request: Request) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { title, description, date, location, maxSeats, program } = body;

    // Validate required fields
    if (!title || !description || !date || !location || !maxSeats || !program) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate program
    if (!['AdultEd', 'No-AdultEd'].includes(program)) {
      return NextResponse.json(
        { message: 'Program must be either AdultEd or No-AdultEd' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      maxSeats: parseInt(maxSeats),
      program,
    });

    return NextResponse.json({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      maxSeats: event.maxSeats,
      program: event.program,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Error creating event' },
      { status: 500 }
    );
  }
}
