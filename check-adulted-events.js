const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdultEdEvents() {
  try {
    console.log('=== All New Events (AdultEd) ===');
    
    // Get events created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newEvents = await prisma.event.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    });

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
    await prisma.$disconnect();
  }
}

checkAdultEdEvents(); 