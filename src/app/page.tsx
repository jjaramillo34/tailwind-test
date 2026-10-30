import {
  Background,
  Button,
  Column,
  Feedback,
  Grid,
  Heading,
  Icon,
  Row,
  Text,
} from '@once-ui-system/core';
import type { IconName } from '@once-ui-system/core';
import connectDB from '@/lib/mongodb';
import Event, { activeEventFilter } from '@/lib/models/Event';
import EventsRegistration from '@/lib/models/EventsRegistration';
import { EventCard } from '@/components/EventCard';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

interface EventWithAvailable {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSeats: number;
  program: string;
  /** Omitted on legacy events; treated as active when undefined */
  isActive?: boolean;
  availableTickets: number;
}

async function getEvents(): Promise<EventWithAvailable[]> {
  await connectDB();
  const events = await Event.find(activeEventFilter).sort({ date: 'asc' });

  // Calculate available tickets for each event
  const eventsWithAvailable = await Promise.all(events.map(async (event) => {
    const registrations = await EventsRegistration.find({ eventId: event._id });
    const ticketsTaken = registrations.reduce((sum, reg) => sum + reg.ticketQuantity, 0);
    const availableTickets = event.maxSeats - ticketsTaken;

    const eventObj = event.toObject();
    return {
      ...eventObj,
      _id: eventObj._id.toString(),
      availableTickets
    };
  }));

  // Only list active events on the public homepage (defense in depth with `activeEventFilter`).
  return eventsWithAvailable.filter((e) => e.isActive !== false);
}

const isBroadway = (event: EventWithAvailable) =>
  event.location.includes('Broadway') ||
  event.location.includes('Theatre') ||
  event.location.includes('Gershwin') ||
  event.location.includes('226 West 46th');

export const dynamic = 'force-dynamic';

function EventSection({
  eyebrow,
  icon,
  title,
  events,
  children,
}: {
  eyebrow: string;
  icon: IconName;
  title: string;
  events: EventWithAvailable[];
  children?: React.ReactNode;
}) {
  return (
    <Column as="section" fillWidth gap="32">
      <Column gap="12" horizontal="center" align="center">
        <Row gap="8" vertical="center">
          <Icon name={icon} size="s" onBackground="brand-medium" />
          <Text variant="label-default-s" onBackground="brand-medium">
            {eyebrow}
          </Text>
        </Row>
        <Heading as="h2" variant="display-strong-s">
          {title}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {events.length} {events.length === 1 ? 'event' : 'events'} ·{' '}
          {events.filter((e) => e.availableTickets > 0).length} with tickets available
        </Text>
      </Column>
      {children}
      <Grid columns="3" gap="16" l={{ columns: 2 }} s={{ columns: 1 }} fillWidth>
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </Grid>
    </Column>
  );
}

export default async function HomePage() {
  const events = await getEvents();
  const broadwayEvents = events.filter(isBroadway);
  const experienceEvents = events.filter((event) => !isBroadway(event));
  const totalAvailable = events.reduce((sum, e) => sum + Math.max(0, e.availableTickets), 0);

  return (
    <>
      <SiteHeader />
      <Column as="main" id="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
        {/* Hero */}
        <Column fillWidth horizontal="center" paddingY="104" paddingX="24">
          <Background
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            gradient={{
              display: true,
              colorStart: 'brand-alpha-medium',
              colorEnd: 'static-transparent',
              x: 50,
              y: 0,
              width: 150,
              height: 80,
              opacity: 60,
            }}
            dots={{ display: true, color: 'neutral-alpha-weak', size: '2', opacity: 40 }}
          />
          <Column zIndex={1} maxWidth="m" horizontal="center" align="center" gap="24">
            <Text variant="label-default-s" onBackground="brand-medium">
              Elite art experiences across New York City
            </Text>
            <Heading as="h1" variant="display-strong-l">
              District 79 Arts Grant Events
            </Heading>
            <Text variant="body-default-xl" onBackground="neutral-weak" wrap="balance">
              Broadway shows and cultural experiences for District 79 students. Tickets are
              distributed first come, first served.
            </Text>
            <Row gap="12" paddingTop="8" s={{ direction: 'column' }}>
              <Button href="/register-programs" size="l" suffixIcon="arrowRight">
                Register now
              </Button>
              <Button href="#events" size="l" variant="secondary">
                Browse events
              </Button>
            </Row>
            {events.length > 0 && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                {events.length} {events.length === 1 ? 'event' : 'events'} · {totalAvailable} tickets still available
              </Text>
            )}
          </Column>
        </Column>

        <Column id="events" maxWidth="l" paddingX="24" gap="104">
          <Column background="surface" border radius="l" padding="32" gap="16">
            <Heading as="h2" variant="heading-strong-l">
              Good day,
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              We are thrilled to announce that District 79 has been awarded an Arts Grant, which has
              provided our students with access to elite art experiences throughout New York City.
              This opportunity will enrich their education and inspire their creativity in
              meaningful ways.
            </Text>
            <Feedback variant="info" title="Registration information">
              All District 79 programs have an opportunity to attend any of the events listed
              below. Tickets will be distributed on a first come, first served basis.
            </Feedback>
          </Column>

          {broadwayEvents.length > 0 && (
            <EventSection
              eyebrow="Broadway shows"
              icon="theater"
              title="Broadway productions"
              events={broadwayEvents}
            >
              <Row fillWidth horizontal="center">
                <Feedback variant="warning" title="Please note" style={{ maxWidth: '48rem' }}>
                  Broadway shows do not use a standardized rating system to indicate mature themes.
                  While each of the productions listed below is appropriate for audiences aged 8 and
                  older, please be advised that some shows may contain themes such as magic,
                  monsters, betrayal, and death. We recognize and respect the diversity of our
                  community. Due to differences in religion, culture, and personal values, some
                  content may be perceived as sensitive or potentially offensive. We encourage
                  educators and guardians to review show descriptions in advance and prepare
                  students accordingly.
                </Feedback>
              </Row>
            </EventSection>
          )}

          {experienceEvents.length > 0 && (
            <EventSection
              eyebrow="Cultural experiences"
              icon="palette"
              title="Other experiences"
              events={experienceEvents}
            />
          )}

          {events.length === 0 && (
            <Column center gap="12" padding="48" background="surface" border radius="l">
              <Icon name="calendar" size="l" onBackground="neutral-weak" />
              <Heading as="h2" variant="heading-strong-m">
                No upcoming events right now
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                New events are added throughout the year. Check back soon.
              </Text>
            </Column>
          )}

          {/* Call to action */}
          <Column
            fillWidth
            horizontal="center"
            align="center"
            gap="16"
            padding="48"
            radius="xl"
            background="brand-alpha-weak"
            border="brand-alpha-medium"
          >
            <Heading as="h2" variant="display-strong-xs">
              Ready to register?
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Don&apos;t miss out on these opportunities for your students. Register now to secure
              your tickets.
            </Text>
            <Button href="/register-programs" size="l" suffixIcon="arrowRight">
              Register for programs
            </Button>
          </Column>
        </Column>
      </Column>
      <SiteFooter />
    </>
  );
}
