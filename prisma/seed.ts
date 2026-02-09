import mongoose, { Schema, Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });
dotenv.config(); // Also load .env if it exists

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI or DATABASE_URL environment variable inside .env.local');
}

// Event Schema
const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    maxSeats: {
      type: Number,
      required: true,
    },
    program: {
      type: String,
      default: 'No-AdultEd',
      enum: ['AdultEd', 'No-AdultEd'],
    },
  },
  {
    timestamps: true,
  }
);

const Event: Model<any> = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all existing events (optional - comment out if you want to keep existing data)
    // await mongoose.model('EventsRegistration').deleteMany({});
    // await Event.deleteMany({});

    // 2026 Events
    const events = [
      {
        title: 'Wicked',
        description: 'Wicked - Broadway musical at the Gershwin Theatre. The untold story of the witches of Oz.',
        date: new Date('2026-03-11T18:00:00Z'), // March 11, 2026 at 2:00 p.m. (14:00 EST = 18:00 UTC, accounting for EDT)
        location: 'Gershwin Theatre - 222 West 51st Street New York, NY 10019',
        maxSeats: 81,
        program: 'No-AdultEd',
      },
      {
        title: 'Intrepid Museum Experience',
        description: 'Intrepid Museum experience at Pier 86. Explore the aircraft carrier Intrepid, a National Historic Landmark.',
        date: new Date('2026-03-11T14:30:00Z'), // March 11, 2026 at 10:30 a.m. (10:30 EST = 14:30 UTC, accounting for EDT)
        location: 'Intrepid Museum - Pier 86 @ 12th Avenue & 46th Street New York, NY 10036',
        maxSeats: 60,
        program: 'No-AdultEd',
      },
      {
        title: 'Hamilton',
        description: 'Hamilton - The revolutionary Broadway musical about Alexander Hamilton.',
        date: new Date('2026-04-15T17:00:00Z'), // April 15, 2026 at 1:00 p.m. (13:00 EST = 17:00 UTC, accounting for EDT)
        location: '226 West 46th Street New York, NY 10036',
        maxSeats: 60,
        program: 'No-AdultEd',
      },
      {
        title: 'Sloomoo Institute Experience',
        description: 'Sloomoo Institute - SoHo New York experience. An immersive, multi-sensory experience celebrating slime.',
        date: new Date('2026-03-27T16:00:00Z'), // March 27, 2026 - Time TBD, using 12:00 p.m. (noon) as default (12:00 EST = 16:00 UTC, accounting for EDT)
        location: 'Sloomoo Institute - SoHo New York 475 Broadway New York, NY 10013',
        maxSeats: 75,
        program: 'No-AdultEd',
      },
    ];

    // Delete all existing events before inserting new ones
    try {
      await Event.deleteMany({});
      console.log('Deleted all existing events.');
    } catch (error) {
      console.log('No events to delete or error occurred:', error);
    }

    // Insert all 2026 events
    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events for 2026.`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
