const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI or DATABASE_URL environment variable');
  process.exit(1);
}

// Event Schema
const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  maxSeats: Number,
  program: { type: String, default: 'No-AdultEd' },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function checkAdultEdEvents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== All New Events (AdultEd) ===');
    
    // Get events created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newEvents = await Event.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ date: 'asc' });

    newEvents.forEach(event => {
      const eventDate = new Date(event.date);
      console.log(`Title: ${event.title}`);
      console.log(`Program: ${event.program}`);
      console.log(`Date: ${eventDate.toLocaleDateString()} @ ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`Max Seats: ${event.maxSeats}`);
      console.log(`Location: ${event.location}`);
      console.log('---');
    });

    console.log(`Total new events: ${newEvents.length}`);

    // Verify all are AdultEd
    const allAdultEd = newEvents.every(e => e.program === 'AdultEd');
    console.log(`\nAll events are AdultEd: ${allAdultEd ? '✅ YES' : '❌ NO'}`);

    if (!allAdultEd) {
      const nonAdultEd = newEvents.filter(e => e.program !== 'AdultEd');
      console.log('Non-AdultEd events found:');
      nonAdultEd.forEach(e => console.log(`- ${e.title} (${e.program})`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAdultEdEvents();
