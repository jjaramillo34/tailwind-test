import connectDB from '@/lib/mongodb';
import EventsRegistration from '@/lib/models/EventsRegistration';
import RegistrationsTable from './RegistrationsTable';
import EventsManager from './EventsManager';
import SettingsTab from './SettingsTab';
import DashboardTabs from './DashboardTabs';
import LogoutButton from './LogoutButton';
import { isAdminAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const isAuthenticated = await isAdminAuthenticated();
  
  if (!isAuthenticated) {
    redirect('/dashboard/login');
  }

  await connectDB();
  
  // Fetch all registrations with event info
  const registrations = await EventsRegistration.find({})
    .populate('eventId')
    .sort({ createdAt: 'desc' });

  // Convert dates to string for client component.
  // Some registrations can reference events that were deleted; populate() returns null in that case.
  const registrationsForClient = registrations.map((r) => {
    const populatedEvent = r.eventId && typeof r.eventId === 'object' && '_id' in (r.eventId as any)
      ? (r.eventId as any)
      : null;

    const fallbackEventId =
      populatedEvent?._id?.toString?.() ??
      (r.eventId ? (r.eventId as any).toString?.() : 'deleted-event');

    return {
      id: r._id.toString(),
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      school: r.school,
      position: r.position,
      ticketQuantity: r.ticketQuantity,
      eventId: fallbackEventId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      event: {
        id: fallbackEventId,
        title: populatedEvent?.title ?? 'Deleted Event',
        description: populatedEvent?.description ?? 'This event no longer exists.',
        date: populatedEvent?.date?.toISOString?.() ?? r.createdAt.toISOString(),
        location: populatedEvent?.location ?? 'N/A',
        maxSeats: populatedEvent?.maxSeats ?? 0,
        program: populatedEvent?.program ?? 'N/A',
      },
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <LogoutButton />
        </div>
        
        <DashboardTabs
          eventsContent={<EventsManager />}
          registrationsContent={
            <div>
              <h3 className="text-xl font-bold mb-4">Registrations</h3>
              <RegistrationsTable registrations={registrationsForClient} />
            </div>
          }
          settingsContent={<SettingsTab />}
        />
      </div>
    </div>
  );
} 