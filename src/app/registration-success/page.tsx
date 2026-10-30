'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Column,
  Feedback,
  Grid,
  Heading,
  Icon,
  InlineCode,
  Row,
  Spinner,
  Text,
} from '@once-ui-system/core';
import type { IconName } from '@once-ui-system/core';
import { formatNyDateLong, formatNyTime } from '@/lib/nyDatetime';
import { SiteHeader } from '@/components/SiteHeader';

const CONTACT_LINE =
  'If you have any questions, please contact Nyesha Green at NGreene4@schools.nyc.gov or Javier Jaramillo at jjaramillo7@schools.nyc.gov.';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
        <Column maxWidth="m" gap="32">
          {children}
        </Column>
      </Column>
    </>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <Column fillWidth center gap="16" style={{ minHeight: '60vh' }}>
      <Spinner size="l" />
      <Text variant="body-default-m" onBackground="neutral-weak">{label}</Text>
    </Column>
  );
}

function SuccessHeader({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <Column horizontal="center" align="center" gap="16">
      <Row width="64" height="64" center radius="full" solid="success-strong">
        <Icon name="check" size="l" onSolid="success-strong" />
      </Row>
      <Heading as="h1" variant="display-strong-s">
        {title}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-weak">
        {subtitle}
      </Text>
    </Column>
  );
}

function DetailTile({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <Column gap="8" padding="20" radius="l" background="neutral-alpha-weak">
      <Row gap="8" vertical="center">
        <Icon name={icon} size="xs" onBackground="brand-medium" />
        <Text variant="label-default-s" onBackground="neutral-weak">{label}</Text>
      </Row>
      {children}
    </Column>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Column gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">{label}</Text>
      <Text variant="body-strong-m" style={{ overflowWrap: 'anywhere' }}>{value}</Text>
    </Column>
  );
}

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isBulk = searchParams.get('bulk') === 'true';
  const bulkCount = searchParams.get('count');

  useEffect(() => {
    const registrationId = searchParams.get('id');
    if (registrationId) {
      fetch(`/api/registration/${registrationId}`)
        .then(res => res.json())
        .then(data => {
          setRegistration(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isBulk) {
      // For bulk registrations, we'll show a summary
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams, isBulk]);

  if (loading) {
    return <Loading label="Loading registration details…" />;
  }

  if (isBulk && bulkCount) {
    const count = parseInt(bulkCount);
    return (
      <PageShell>
        <SuccessHeader
          title="You're registered!"
          subtitle={`You registered for ${bulkCount} event${count !== 1 ? 's' : ''}.`}
        />
        <Column background="surface" border radius="l" padding="32" gap="20">
          <Heading as="h2" variant="heading-strong-l">Registration summary</Heading>
          <Feedback
            variant="success"
            title="All registrations completed"
            description="You will receive confirmation emails for each event. Check your inbox for the details of each registration."
          />
          <Field label="Total events registered" value={bulkCount} />
          <Text variant="body-default-s" onBackground="neutral-weak">{CONTACT_LINE}</Text>
        </Column>
        <Row gap="12" horizontal="center" s={{ direction: 'column' }}>
          <Button href="/register-programs" size="l" prefixIcon="plus">
            Register for more events
          </Button>
          <Button href="/" size="l" variant="secondary" prefixIcon="home">
            Return to home
          </Button>
        </Row>
      </PageShell>
    );
  }

  if (!registration) {
    return (
      <PageShell>
        <Column background="surface" border radius="l" padding="40" gap="16" horizontal="center" align="center">
          <Row width="56" height="56" center radius="full" background="danger-alpha-weak">
            <Icon name="close" size="m" onBackground="danger-strong" />
          </Row>
          <Heading as="h1" variant="heading-strong-xl">Registration not found</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            We couldn&apos;t find your registration details. Check your registration link or contact support.
          </Text>
          <Row gap="12" paddingTop="8" s={{ direction: 'column' }}>
            <Button href="/register-programs">Register for an event</Button>
            <Button href="/" variant="secondary">Return to home</Button>
          </Row>
        </Column>
      </PageShell>
    );
  }

  const registrationDate = new Date(registration.createdAt);
  const eventDate = new Date(registration.event.date);
  const isAdultEd = registration.event.program === 'AdultEd';

  return (
    <PageShell>
      <SuccessHeader
        title="Registration successful!"
        subtitle={
          <>
            Registration ID <InlineCode>{registration.id}</InlineCode>
          </>
        }
      />

      <Row horizontal="center" className="print-hidden">
        <Button variant="secondary" prefixIcon="printer" onClick={() => window.print()}>
          Print confirmation
        </Button>
      </Row>

      <Column background="surface" border radius="l" overflow="hidden">
        <Column padding="32" gap="8" background="brand-alpha-weak" borderBottom s={{ padding: '20' }}>
          <Text variant="label-default-s" onBackground="brand-medium">Your event</Text>
          <Heading as="h2" variant="display-strong-xs">{registration.event.title}</Heading>
          {registration.event.description && (
            <Text variant="body-default-m" onBackground="neutral-weak">{registration.event.description}</Text>
          )}
        </Column>

        <Column padding="32" gap="32" s={{ padding: '20' }}>
          <Grid columns="2" gap="12" s={{ columns: 1 }}>
            <DetailTile icon="calendar" label="Date & time">
              <Text variant="heading-strong-m">{formatNyDateLong(eventDate)}</Text>
              <Text variant="body-default-m" onBackground="neutral-medium">{formatNyTime(eventDate)}</Text>
            </DetailTile>
            <DetailTile icon="mapPin" label="Location">
              <Text variant="heading-strong-m">{registration.event.location}</Text>
            </DetailTile>
            <DetailTile icon="ticket" label="Tickets reserved">
              <Text variant="display-strong-xs">{registration.ticketQuantity}</Text>
            </DetailTile>
            <DetailTile icon="check" label="Registered on">
              <Text variant="heading-strong-m">{formatNyDateLong(registrationDate)}</Text>
              <Text variant="body-default-m" onBackground="neutral-medium">{formatNyTime(registrationDate)}</Text>
            </DetailTile>
          </Grid>

          <Column gap="16">
            <Row gap="8" vertical="center">
              <Icon name="person" size="s" onBackground="brand-medium" />
              <Heading as="h3" variant="heading-strong-m">Registrant</Heading>
            </Row>
            <Grid columns="2" gap="20" s={{ columns: 1 }}>
              <Field label="Full name" value={`${registration.firstName} ${registration.lastName}`} />
              <Field label="Email" value={registration.email} />
              <Field label="School" value={registration.school} />
              <Field label="Position" value={registration.position} />
            </Grid>
          </Column>
        </Column>
      </Column>

      <Feedback variant="warning" title="Important information">
        <Column as="ul" gap="4" paddingLeft="16" margin="0">
          <Text as="li" variant="body-default-s">Please save or print this confirmation for your records.</Text>
          <Text as="li" variant="body-default-s">You will receive additional event details by email closer to the event date.</Text>
          <Text as="li" variant="body-default-s">{CONTACT_LINE}</Text>
        </Column>
      </Feedback>

      <Row gap="12" horizontal="center" s={{ direction: 'column' }} className="print-hidden">
        <Button href={isAdultEd ? '/register-adulted' : '/register-programs'} size="l" prefixIcon="plus">
          {isAdultEd ? 'Register for another AdultEd event' : 'Register for another Programs event'}
        </Button>
        <Button href="/" size="l" variant="secondary" prefixIcon="home">
          Return to home
        </Button>
      </Row>
    </PageShell>
  );
}

export default function RegistrationSuccess() {
  return (
    <Suspense fallback={<Loading label="Loading…" />}>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
