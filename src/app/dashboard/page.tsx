import { prisma } from '@/lib/prisma';
import RegistrationsTable from './RegistrationsTable';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch all registrations with event info
  const registrations = await prisma.eventsRegistration.findMany({
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });

  // Convert dates to string for client component
  const registrationsForClient = registrations.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    event: {
      ...r.event,
      date: r.event.date.toISOString(),
    },
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6">Registrations Dashboard</h2>
        <RegistrationsTable registrations={registrationsForClient} />
      </div>
    </div>
  );
} 