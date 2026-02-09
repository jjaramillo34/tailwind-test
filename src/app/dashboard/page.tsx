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

  // Convert dates to string for client component
  const registrationsForClient = registrations.map(r => ({
    id: r._id.toString(),
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    school: r.school,
    position: r.position,
    ticketQuantity: r.ticketQuantity,
    eventId: r.eventId.toString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    event: {
      id: (r.eventId as any)._id.toString(),
      title: (r.eventId as any).title,
      description: (r.eventId as any).description,
      date: (r.eventId as any).date.toISOString(),
      location: (r.eventId as any).location,
      maxSeats: (r.eventId as any).maxSeats,
      program: (r.eventId as any).program,
    },
  }));

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