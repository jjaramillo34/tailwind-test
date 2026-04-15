import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EventsRegistration from '@/lib/models/EventsRegistration';
import Event from '@/lib/models/Event';
import { isAdminAuthenticated } from '@/lib/auth';

// POST cleanup orphan registrations (registrations whose event no longer exists)
export async function POST() {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure Event model is initialized and collection exists for lookup.
    void Event;

    const orphanRegistrations = await EventsRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $match: {
          event: { $size: 0 },
        },
      },
      {
        $project: { _id: 1 },
      },
    ]);

    if (orphanRegistrations.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No orphan registrations found.',
      });
    }

    const orphanIds = orphanRegistrations.map((doc) => doc._id);
    const deleteResult = await EventsRegistration.deleteMany({
      _id: { $in: orphanIds },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount ?? 0,
      message: 'Orphan registrations cleaned up successfully.',
    });
  } catch (error) {
    console.error('Error cleaning orphan registrations:', error);
    return NextResponse.json(
      { message: 'Error cleaning orphan registrations' },
      { status: 500 }
    );
  }
}
