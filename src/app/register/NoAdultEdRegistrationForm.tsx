"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Column,
  Feedback,
  Grid,
  Heading,
  Icon,
  IconButton,
  Input,
  Line,
  NumberInput,
  Row,
  Select,
  Tag,
  Text,
} from "@once-ui-system/core";
import { formatNyDateLong, formatNyTime } from "@/lib/nyDatetime";
import { NYC_DOE_EMAIL_SUFFIX, SCHOOL_OPTIONS } from "@/lib/schools";
import { SiteHeader } from "@/components/SiteHeader";

type EventWithProgram = {
  _id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  maxSeats: number;
  program: string;
  availableTickets: number;
};

interface NoAdultEdRegistrationFormProps {
  events: EventWithProgram[];
}

type SelectedEvent = {
  eventId: string;
  event: EventWithProgram;
  ticketQuantity: number;
};

const MAX_TICKETS_PER_EVENT = 10;

const plural = (count: number, word: string) => `${count} ${word}${count !== 1 ? "s" : ""}`;

function StepHeading({ step, title, aside }: { step: number; title: string; aside?: React.ReactNode }) {
  return (
    <Row gap="12" vertical="center" wrap>
      <Row
        width="32"
        height="32"
        center
        radius="full"
        background="brand-alpha-weak"
        textVariant="label-strong-s"
        onBackground="brand-strong"
      >
        {step}
      </Row>
      <Heading as="h2" variant="heading-strong-l">
        {title}
      </Heading>
      {aside}
    </Row>
  );
}

export default function NoAdultEdRegistrationForm({ events }: NoAdultEdRegistrationFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    position: "",
  });
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [schoolError, setSchoolError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;

  const toggleEventSelection = (event: EventWithProgram) => {
    setSelectedEvents(prev => {
      const existing = prev.find(se => se.eventId === event._id);
      if (existing) {
        // Remove event
        return prev.filter(se => se.eventId !== event._id);
      } else {
        // Add event with default 1 ticket
        return [...prev, { eventId: event._id, event, ticketQuantity: 1 }];
      }
    });
  };

  const updateTicketQuantity = (eventId: string, quantity: number) => {
    const numQuantity = parseInt(quantity.toString());
    if (isNaN(numQuantity) || numQuantity < 1) return;

    setSelectedEvents(prev => prev.map(se => {
      if (se.eventId === eventId) {
        const maxTickets = Math.min(se.event.availableTickets, MAX_TICKETS_PER_EVENT);
        return { ...se, ticketQuantity: Math.min(numQuantity, maxTickets) };
      }
      return se;
    }));
  };

  const removeEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(se => se.eventId !== eventId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors([]);
    setSchoolError("");

    if (!formData.school) {
      setSchoolError("Please select your school");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!formData.email.endsWith(NYC_DOE_EMAIL_SUFFIX)) {
        throw new Error("Please use a valid NYC Department of Education email address (@schools.nyc.gov)");
      }
      if (selectedEvents.length === 0) {
        throw new Error("Please select at least one event");
      }

      // Validate each selected event
      const validationErrors: string[] = [];
      selectedEvents.forEach(se => {
        if (se.ticketQuantity < 1) {
          validationErrors.push(`${se.event.title}: Ticket quantity must be at least 1`);
        }
        if (se.ticketQuantity > se.event.availableTickets) {
          validationErrors.push(`${se.event.title}: Only ${se.event.availableTickets} tickets available`);
        }
        if (se.ticketQuantity > MAX_TICKETS_PER_EVENT) {
          validationErrors.push(`${se.event.title}: Maximum ${MAX_TICKETS_PER_EVENT} tickets per event`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Prepare bulk registration
      const registrations = selectedEvents.map(se => ({
        eventId: se.eventId,
        ticketQuantity: se.ticketQuantity
      }));

      const response = await fetch("/api/register/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          registrations
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors);
        } else {
          setError(data.message || "Registration failed");
        }
        setIsSubmitting(false);
        return;
      }

      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const emailInvalid = formData.email.length > 0 && formData.email.includes("@") && !formData.email.endsWith(NYC_DOE_EMAIL_SUFFIX);
  const availableEvents = events.filter(event => event.availableTickets > 0);
  const hasSelectedEvents = selectedEvents.length > 0;
  const totalTickets = selectedEvents.reduce((sum, se) => sum + se.ticketQuantity, 0);

  return (
    <>
      <SiteHeader />
      <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
        <Column maxWidth="l" gap="32">
          {/* Header */}
          <Column gap="12">
            <Row>
              <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft">
                Back to home
              </Button>
            </Row>
            <Heading as="h1" variant="display-strong-s">
              Programs event registration
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Register for one or more District 79 Programs events at once. Fill in your details,
              pick your events, and confirm.
            </Text>
          </Column>

          <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
            {/* Left: details + event picker */}
            <Column fillWidth gap="24">
              <Column background="surface" border radius="l" padding="32" gap="24" s={{ padding: "20" }}>
                <StepHeading step={1} title="Your information" />
                <form ref={formRef} onSubmit={handleSubmit}>
                  <Column gap="16">
                    <Grid columns="2" gap="16" s={{ columns: 1 }}>
                      <Input
                        id="firstName"
                        name="firstName"
                        label="First name"
                        required
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      <Input
                        id="lastName"
                        name="lastName"
                        label="Last name"
                        required
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email address"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={emailInvalid}
                      errorMessage={emailInvalid ? "Use your @schools.nyc.gov address" : undefined}
                      description={emailInvalid ? undefined : "Must be a @schools.nyc.gov email address"}
                    />
                    <Select
                      id="school"
                      label="School"
                      searchable
                      options={SCHOOL_OPTIONS}
                      value={formData.school}
                      onSelect={(value) => {
                        setFormData(prev => ({ ...prev, school: value as string }));
                        setSchoolError("");
                      }}
                      error={!!schoolError}
                      errorMessage={schoolError || undefined}
                    />
                    <Input
                      id="position"
                      name="position"
                      label="Position"
                      placeholder="e.g. Teacher, Administrator"
                      required
                      autoComplete="organization-title"
                      value={formData.position}
                      onChange={handleChange}
                    />
                  </Column>
                </form>
              </Column>

              <Column background="surface" border radius="l" padding="32" gap="24" s={{ padding: "20" }}>
                <StepHeading
                  step={2}
                  title="Choose events"
                  aside={hasSelectedEvents && (
                    <Tag scheme="brand" size="s">{selectedEvents.length} selected</Tag>
                  )}
                />
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Select as many events as you like. Up to {MAX_TICKETS_PER_EVENT} tickets per event.
                </Text>

                {availableEvents.length === 0 ? (
                  <Column center gap="8" padding="40" border radius="l" borderStyle="dashed">
                    <Icon name="calendar" size="l" onBackground="neutral-weak" />
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      No events are open for registration right now.
                    </Text>
                  </Column>
                ) : (
                  <Grid columns="2" gap="12" s={{ columns: 1 }}>
                    {availableEvents.map(event => {
                      const isSelected = selectedEvents.some(se => se.eventId === event._id);
                      return (
                        <Card
                          key={event._id}
                          onClick={() => toggleEventSelection(event)}
                          selected={isSelected}
                          aria-label={`${isSelected ? "Remove" : "Select"} ${event.title}`}
                          direction="column"
                          padding="20"
                          gap="12"
                          radius="l"
                          fillHeight
                        >
                          <Row horizontal="between" vertical="start" gap="12" fillWidth>
                            <Text variant="heading-strong-s">{event.title}</Text>
                            <Row
                              width="24"
                              height="24"
                              center
                              radius="full"
                              border={isSelected ? "brand-strong" : true}
                              solid={isSelected ? "brand-strong" : undefined}
                              style={{ flexShrink: 0 }}
                            >
                              {isSelected && <Icon name="check" size="xs" onSolid="brand-strong" />}
                            </Row>
                          </Row>
                          <Column gap="4">
                            <Row gap="8" vertical="center">
                              <Icon name="calendar" size="xs" onBackground="neutral-weak" />
                              <Text variant="body-default-s" onBackground="neutral-medium">
                                {formatNyDateLong(event.date)} · {formatNyTime(event.date)}
                              </Text>
                            </Row>
                            <Row gap="8" vertical="center">
                              <Icon name="mapPin" size="xs" onBackground="neutral-weak" />
                              <Text variant="body-default-s" onBackground="neutral-weak">
                                {event.location}
                              </Text>
                            </Row>
                          </Column>
                          <Row marginTop="auto">
                            <Tag size="s" scheme={event.availableTickets <= 10 ? "warning" : "success"} prefixIcon="ticket">
                              {plural(event.availableTickets, "ticket")} available
                            </Tag>
                          </Row>
                        </Card>
                      );
                    })}
                  </Grid>
                )}
              </Column>
            </Column>

            {/* Right: summary + submit */}
            <Column
              gap="16"
              background="surface"
              border
              radius="l"
              padding="24"
              position="sticky"
              top="80"
              style={{ width: "24rem", flexShrink: 0 }}
              m={{ position: "static", style: { width: "100%" } }}
            >
              <Row horizontal="between" vertical="center">
                <Heading as="h2" variant="heading-strong-m">
                  Your selection
                </Heading>
                {hasSelectedEvents && (
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {plural(totalTickets, "ticket")}
                  </Text>
                )}
              </Row>

              {!hasSelectedEvents ? (
                <Column center gap="8" paddingY="24" align="center">
                  <Icon name="ticket" size="m" onBackground="neutral-weak" />
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Events you choose appear here.
                  </Text>
                </Column>
              ) : (
                <Column gap="12">
                  {selectedEvents.map(se => {
                    const maxTickets = Math.min(se.event.availableTickets, MAX_TICKETS_PER_EVENT);
                    return (
                      <Column key={se.eventId} gap="12" padding="16" radius="m" background="neutral-alpha-weak">
                        <Row horizontal="between" vertical="start" gap="8">
                          <Column gap="4">
                            <Text variant="label-strong-s">{se.event.title}</Text>
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                              {formatNyDateLong(se.event.date)} · {formatNyTime(se.event.date)}
                            </Text>
                          </Column>
                          <IconButton
                            icon="close"
                            size="s"
                            variant="tertiary"
                            tooltip="Remove"
                            ariaLabel={`Remove ${se.event.title}`}
                            onClick={() => removeEvent(se.eventId)}
                          />
                        </Row>
                        <NumberInput
                          id={`tickets-${se.eventId}`}
                          label="Tickets"
                          size="xs"
                          min={1}
                          max={maxTickets}
                          value={se.ticketQuantity}
                          onChange={(value) => updateTicketQuantity(se.eventId, value)}
                          description={`Max ${maxTickets} · ${se.event.availableTickets} available`}
                        />
                      </Column>
                    );
                  })}
                </Column>
              )}

              {(error || errors.length > 0) && (
                <Feedback variant="danger" title={error || "Please fix the following"}>
                  {errors.length > 0 && (
                    <Column as="ul" gap="4" paddingLeft="16" margin="0">
                      {errors.map((err, idx) => (
                        <Text as="li" key={idx} variant="body-default-s">{err}</Text>
                      ))}
                    </Column>
                  )}
                </Feedback>
              )}

              <Line />
              <Button
                type="button"
                fillWidth
                size="l"
                loading={isSubmitting}
                disabled={isSubmitting || !hasSelectedEvents}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {isSubmitting
                  ? `Registering for ${plural(selectedEvents.length, "event")}…`
                  : hasSelectedEvents
                    ? `Register for ${plural(selectedEvents.length, "event")}`
                    : "Select an event to continue"}
              </Button>
              <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
                By submitting, you agree to the terms and conditions of event registration.
              </Text>
            </Column>
          </Row>
        </Column>
      </Column>
    </>
  );
}
