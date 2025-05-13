const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.eventsRegistration.deleteMany();
  await prisma.event.deleteMany();

  // Create sample events
  const events = [
    {
      title: 'MJ The Musical',
      description: 'Featuring a book by two-time Pulitzer Prize winner Lynn Nottage and Tony Award®-winning choreography from director Christopher Wheeldon, MJ goes beyond the singular moves and signature sound of the star, offering a rare look at the creative mind and collaborative spirit that catapulted Michael Jackson into legendary status.',
      date: new Date('2025-06-11T14:00:00Z'),
      location: 'Broadway',
      maxSeats: 66,
      program: 'No-AdultEd',
    },
    {
      title: 'Harry Potter and the Cursed Child',
      description: 'There\'s more magic in every moment at Harry Potter and the Cursed Child, the 8th story in the Harry Potter series and the most awarded new play in history. Now playing live on Broadway eight times a week at the Lyric Theatre.',
      date: new Date('2025-05-28T14:00:00Z'),
      location: 'Lyric Theatre',
      maxSeats: 36,
      program: 'No-AdultEd',
    },
    {
      title: 'Stranger Things',
      description: 'STRANGER THINGS: THE FIRST SHADOW astonished the West End, winning the Olivier Award for Best Entertainment. Critics hailed it as "a game-changing experience" that makes the unimaginable real and "takes theatre to the next dimension".',
      date: new Date('2025-06-04T14:00:00Z'),
      location: 'Broadway',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      title: 'One World Observatory',
      description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
      date: new Date('2025-06-13T11:00:00Z'),
      location: 'One World Trade Center',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      title: 'One World Observatory',
      description: 'One World Observatory experience. Lunch will be provided for all! Staten Island will receive priority tickets.',
      date: new Date('2025-06-13T13:00:00Z'),
      location: 'One World Trade Center',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    {
      title: 'Lion King',
      description: 'Since opening on Broadway in November 1997, THE LION KING has become the most successful musical in history. It currently plays 8 times a week at the Minskoff Theatre, in the heart of Times Square.',
      date: new Date('2025-05-21T14:00:00Z'),
      location: 'Minskoff Theatre',
      maxSeats: 35,
      program: 'No-AdultEd',
    },
    // AdultEd events
    {
      title: 'Hells Kitchen (Evening)',
      description: 'Hells Kitchen (Evening) - AdultEd program event.',
      date: new Date('2025-06-04T19:30:00Z'),
      location: 'Broadway',
      maxSeats: 46,
      program: 'AdultEd',
    },
    {
      title: 'Group Trip (Evening)',
      description: 'Group Trip (Evening) - AdultEd program event.',
      date: new Date('2025-06-13T18:00:00Z'),
      location: 'Various',
      maxSeats: 75,
      program: 'AdultEd',
    },
    {
      title: 'Death Becomes Her (Evening)',
      description: 'Death Becomes Her (Evening) - AdultEd program event.',
      date: new Date('2025-05-21T19:30:00Z'),
      location: 'Broadway',
      maxSeats: 55,
      program: 'AdultEd',
    },
    {
      title: 'Belongó',
      description: 'Belongó is dedicated to performing, educating about, and preserving the music of all of the Americas, emanating from African and indigenous roots, through the entry point of jazz.',
      date: new Date('2025-06-15T15:00:00Z'),
      location: 'Various Schools',
      maxSeats: 4,
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });