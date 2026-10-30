import { Column, Icon, Row, Tag, Text } from '@once-ui-system/core';
import type { IconName } from '@once-ui-system/core';
import { formatNyDateLong, formatNyTime } from '@/lib/nyDatetime';

export interface EventCardData {
  _id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  maxSeats: number;
  availableTickets: number;
}

/** Few enough seats left that we nudge visitors to register soon. */
const LOW_AVAILABILITY = 10;

function Detail({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <Row gap="8" vertical="center">
      <Icon name={icon} size="xs" onBackground="brand-medium" />
      <Text variant="body-default-s" onBackground="neutral-medium">
        {children}
      </Text>
    </Row>
  );
}

export function AvailabilityTag({ available }: { available: number }) {
  if (available <= 0) {
    return (
      <Tag size="m" scheme="danger" prefixIcon="close">
        Sold out
      </Tag>
    );
  }
  return (
    <Tag size="m" scheme={available <= LOW_AVAILABILITY ? 'warning' : 'success'} prefixIcon="ticket">
      {available} {available === 1 ? 'ticket' : 'tickets'} left
    </Tag>
  );
}

export function EventCard({ event }: { event: EventCardData }) {
  const hasValidDate = Number.isFinite(new Date(event.date).getTime());
  const soldOut = event.availableTickets <= 0;

  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="24"
      gap="16"
      fillHeight
      opacity={soldOut ? 70 : undefined}
    >
      <Text as="h3" variant="heading-strong-m" wrap="balance">
        {event.title}
      </Text>
      <Column gap="8">
        <Detail icon="calendar">{formatNyDateLong(event.date)}</Detail>
        {hasValidDate && <Detail icon="time">{formatNyTime(event.date)}</Detail>}
        <Detail icon="mapPin">{event.location}</Detail>
      </Column>
      <Text
        variant="body-default-s"
        onBackground="neutral-weak"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {event.description}
      </Text>
      <Row marginTop="auto" paddingTop="8">
        <AvailabilityTag available={event.availableTickets} />
      </Row>
    </Column>
  );
}
