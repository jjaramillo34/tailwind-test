import Image from 'next/image';
import { Button, Column, Grid, Heading, Icon, Row, Tag, Text } from '@once-ui-system/core';

export interface LandingEvent {
  title: string;
  date: string;
  time: string;
  tickets: number;
}

interface ProgramLandingProps {
  title: string;
  programLabel: string;
  events: LandingEvent[];
  ctaHref: string;
  ctaLabel: string;
}

export function ProgramLanding({ title, programLabel, events, ctaHref, ctaLabel }: ProgramLandingProps) {
  return (
    <Column as="main" fillWidth horizontal="center" paddingY="64" paddingX="16">
      <Column maxWidth="m" background="surface" border radius="xl" padding="40" gap="32" s={{ padding: '24' }}>
        <Column horizontal="center" align="center" gap="16">
          <Image src="/images/d79logo.png" alt="District 79 logo" width={128} height={64} priority />
          <Heading as="h1" variant="display-strong-xs">
            {title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
            District 79 {programLabel} events are special opportunities for our community to
            experience Broadway and cultural events together. Review the events below, then
            register. Tickets are limited and available first come, first served.
          </Text>
        </Column>

        <Grid columns="2" gap="12" s={{ columns: 1 }}>
          {events.map((event) => (
            <Column
              key={event.title + event.date + event.time}
              border
              radius="l"
              padding="20"
              gap="8"
              background="page"
            >
              <Text as="h2" variant="heading-strong-s">
                {event.title}
              </Text>
              <Row gap="8" vertical="center">
                <Icon name="calendar" size="xs" onBackground="brand-medium" />
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {event.date} · {event.time}
                </Text>
              </Row>
              <Row gap="8" paddingTop="4" wrap>
                <Tag size="s" scheme="brand" prefixIcon="ticket">
                  {event.tickets} tickets
                </Tag>
                <Tag size="s" scheme="neutral">
                  {programLabel}
                </Tag>
              </Row>
            </Column>
          ))}
        </Grid>

        <Button href={ctaHref} size="l" fillWidth suffixIcon="arrowRight">
          {ctaLabel}
        </Button>
      </Column>
    </Column>
  );
}
