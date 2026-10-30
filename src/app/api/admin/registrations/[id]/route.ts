import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EventsRegistration from '@/lib/models/EventsRegistration';
import { isAdminAuthenticated } from '@/lib/auth';
import { Types } from 'mongoose';

// DELETE registration
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
        { message: 'Invalid registration ID' },
        { status: 400 }
      );
    }

    const registration = await EventsRegistration.findByIdAndDelete(id);

    if (!registration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { message: 'Error deleting registration' },
      { status: 500 }
    );
  }
}
