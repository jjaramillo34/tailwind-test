const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  //await prisma.eventsRegistration.deleteMany();
  //await prisma.event.deleteMany();

  // Create sample events
  const events = [
    {
      id: 11,
      title: 'MJ The Musical',
      description: 'Featuring a book by two-time Pulitzer Prize winner Lynn Nottage and Tony Award®-winning choreography from director Christopher Wheeldon, MJ goes beyond the singular moves and signature sound of the star, offering a rare look at the creative mind and collaborative spirit that catapulted Michael Jackson into legendary status.',
      date: new Date('2025-06-11T14:00:00Z'),
      newDate: new Date('2025-06-11T14:00:00Z'),
      location: 'Broadway',
      maxSeats: 66,
      program: 'No-AdultEd',
    },
    {
      id: 12,
      title: 'Harry Potter and the Cursed Child',
      description: 'There\'s more magic in every moment at Harry Potter and the Cursed Child, the 8th story in the Harry Potter series and the most awarded new play in history. Now playing live on Broadway eight times a week at the Lyric Theatre.',
      date: new Date('2025-05-28T14:00:00Z'),
      newDate: new Date('2025-05-28T14:00:00Z'),
      location: 'Lyric Theatre',
      maxSeats: 36,
      program: 'No-AdultEd',
    },
    {
      id: 13,
      title: 'Stranger Things',
      description: 'STRANGER THINGS: THE FIRST SHADOW astonished the West End, winning the Olivier Award for Best Entertainment. Critics hailed it as "a game-changing experience" that makes the unimaginable real and "takes theatre to the next dimension".',
      date: new Date('2025-06-04T14:00:00Z'),
      newDate: new Date('2025-06-04T14:00:00Z'),
      location: 'Broadway',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      id: 14,
      title: 'One World Observatory',
      description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
      date: new Date('2025-06-13T15:00:00Z'),
      newDate: new Date('2025-06-13T15:00:00Z'),
      location: 'One World Trade Center',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      id: 15,
      title: 'One World Observatory',
      description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
      date: new Date('2025-06-13T15:00:00Z'),
      newDate: new Date('2025-06-13T17:00:00Z'),
      location: 'One World Trade Center',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      id: 16,
      title: 'Lion King',
      description: 'Since opening on Broadway in November 1997, THE LION KING has become the most successful musical in history. It currently plays 8 times a week at the Minskoff Theatre, in the heart of Times Square.',
      date: new Date('2025-05-21T14:00:00Z'),
      newDate: new Date('2025-05-21T14:00:00Z'),
      location: 'Minskoff Theatre',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    // AdultEd events
    {
      id: 17,
      title: 'Hells Kitchen (Evening)',
      description: 'Hells Kitchen (Evening) - AdultEd program event.',
      date: new Date('2025-06-04T19:30:00Z'),
      newDate: new Date('2025-06-04T19:30:00Z'),
      location: 'Broadway',
      maxSeats: 46,
      program: 'AdultEd',
    },
    {
      id: 18,
      title: 'Group Trip (Evening)',
      description: 'Group Trip (Evening) - AdultEd program event.',
      date: new Date('2025-06-13T18:00:00Z'),
      newDate: new Date('2025-06-13T18:00:00Z'),
      location: 'Various',
      maxSeats: 75,
      program: 'AdultEd',
    },
    {
      id: 19,
      title: 'Death Becomes Her (Evening)',
      description: 'Death Becomes Her (Evening) - AdultEd program event.',
      date: new Date('2025-05-21T19:30:00Z'),
      newDate: new Date('2025-05-21T19:30:00Z'),
      location: 'Broadway',
      maxSeats: 55,
      program: 'AdultEd',
    },
    {
      id: 20,
      title: 'Belongó',
      description: 'Belongó is dedicated to performing, educating about, and preserving the music of all of the Americas, emanating from African and indigenous roots, through the entry point of jazz.',
      date: new Date('2025-06-15T15:00:00Z'),
      newDate: new Date('2025-06-15T15:00:00Z'),
      location: 'Various Schools',
      maxSeats: 4,
    },
    {
      id: 21,
      title: 'One World Observatory',
      description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
      date: new Date('2025-06-13T22:00:00Z'),
      location: 'One World Trade Center',
      maxSeats: 35,
      program: 'AdultEd',
    },
  ];

  //for (const { id, newDate } of events) {
  //  await prisma.event.updateMany({
  //    where: { id },
  //    data: { date: newDate },
  //  });
  //}

  // Delete the previously created new events
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.event.deleteMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    console.log('Deleted all events created in the last 30 days.');
  } catch (error) {
    console.log('No events to delete or error occurred.');
  }

  // Add the specific new events provided by the user
  try {
    await prisma.event.create({
      data: {
        title: 'Death Becomes Her',
        description: 'Death Becomes Her - Evening AdultEd program event.',
        date: new Date('2025-06-26T19:00:00Z'), // June 26th @ 7 pm
        location: 'Broadway',
        maxSeats: 7,
        program: 'AdultEd',
      }
    });
    console.log('Created Death Becomes Her event.');
  } catch (error) {
    console.log('Death Becomes Her event already exists or error occurred.');
  }

  try {
    await prisma.event.create({
      data: {
        title: 'One World Observatory',
        description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
        date: new Date('2025-06-26T19:00:00Z'), // June 26th @ 7 pm
        location: 'One World Trade Center',
        maxSeats: 15,
        program: 'AdultEd',
      }
    });
    console.log('Created One World Observatory event.');
  } catch (error) {
    console.log('One World Observatory event already exists or error occurred.');
  }

  try {
    await prisma.event.create({
      data: {
        title: 'Lion King',
        description: 'Since opening on Broadway in November 1997, THE LION KING has become the most successful musical in history. It currently plays 8 times a week at the Minskoff Theatre, in the heart of Times Square.',
        date: new Date('2025-07-08T19:00:00Z'), // July 8 - 7 pm
        location: 'Minskoff Theatre',
        maxSeats: 5,
        program: 'AdultEd',
      }
    });
    console.log('Created Lion King event.');
  } catch (error) {
    console.log('Lion King event already exists or error occurred.');
  }

  try {
    await prisma.event.create({
      data: {
        title: 'Stranger Things',
        description: 'STRANGER THINGS: THE FIRST SHADOW astonished the West End, winning the Olivier Award for Best Entertainment. Critics hailed it as "a game-changing experience" that makes the unimaginable real and "takes theatre to the next dimension".',
        date: new Date('2025-07-15T19:00:00Z'), // 7 pm (using July 15 as default since no date specified)
        location: 'Broadway',
        maxSeats: 7,
        program: 'AdultEd',
      }
    });
    console.log('Created Stranger Things event.');
  } catch (error) {
    console.log('Stranger Things event already exists or error occurred.');
  }

  try {
    await prisma.event.create({
      data: {
        title: 'MJ the Musical',
        description: 'Featuring a book by two-time Pulitzer Prize winner Lynn Nottage and Tony Award®-winning choreography from director Christopher Wheeldon, MJ goes beyond the singular moves and signature sound of the star, offering a rare look at the creative mind and collaborative spirit that catapulted Michael Jackson into legendary status.',
        date: new Date('2025-07-01T19:00:00Z'), // July 1 - 7pm
        location: 'Broadway',
        maxSeats: 14,
        program: 'AdultEd',
      }
    });
    console.log('Created MJ the Musical event.');
  } catch (error) {
    console.log('MJ the Musical event already exists or error occurred.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });