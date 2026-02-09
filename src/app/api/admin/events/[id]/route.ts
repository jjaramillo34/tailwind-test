import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { isAdminAuthenticated } from '@/lib/auth';
import { Types } from 'mongoose';

// GET single event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

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
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: 'Error fetching event' },
      { status: 500 }
    );
  }
}

// PUT update event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { title, description, date, location, maxSeats, program } = body;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Validate program if provided
    if (program && !['AdultEd', 'No-AdultEd'].includes(program)) {
      return NextResponse.json(
        { message: 'Program must be either AdultEd or No-AdultEd' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (location) updateData.location = location;
    if (maxSeats) updateData.maxSeats = parseInt(maxSeats);
    if (program) updateData.program = program;

    const event = await Event.findByIdAndUpdate(id, updateData, { new: true });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

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
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Error updating event' },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Error deleting event' },
      { status: 500 }
    );
  }
}
