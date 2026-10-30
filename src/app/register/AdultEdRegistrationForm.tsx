"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Column,
  Feedback,
  Grid,
  Heading,
  Input,
  NumberInput,
  Row,
  Select,
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

interface AdultEdRegistrationFormProps {
  events: EventWithProgram[];
}

const MAX_TICKETS = 10;

export default function AdultEdRegistrationForm({ events }: AdultEdRegistrationFormProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    position: "",
    eventId: "",
    ticketQuantity: "1",
    adultEdNote: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ school?: string; eventId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithProgram | null>(null);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const missing = {
      school: formData.school ? undefined : "Please select your school",
      eventId: selectedEvent ? undefined : "Please select an event",
    };
    setFieldErrors(missing);
    if (missing.school || missing.eventId) return;

    setIsSubmitting(true);
    try {
      if (!formData.email.endsWith(NYC_DOE_EMAIL_SUFFIX)) {
        throw new Error("Please use a valid NYC Department of Education email address (@schools.nyc.gov)");
      }
      if (!selectedEvent) {
        throw new Error("Please select an event");
      }
      const requestedTickets = parseInt(formData.ticketQuantity);
      if (isNaN(requestedTickets) || requestedTickets < 1) {
        throw new Error("Invalid ticket quantity");
      }
      if (requestedTickets > selectedEvent.availableTickets) {
        throw new Error(`Only ${selectedEvent.availableTickets} tickets available for this event`);
      }
      if (requestedTickets > MAX_TICKETS) {
        throw new Error(`You can request a maximum of ${MAX_TICKETS} tickets per registration`);
      }
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: selectedEvent._id,
          ticketQuantity: requestedTickets
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSelect = (value: string) => {
    const event = events.find(e => e._id.toString() === value);
    setSelectedEvent(event || null);
    setFormData(prev => ({ ...prev, eventId: value }));
    setFieldErrors(prev => ({ ...prev, eventId: undefined }));
  };

  const eventOptions = events
    .filter(event => event.availableTickets > 0)
    .map(event => ({
      value: event._id,
      label: event.title,
      description: `${formatNyDateLong(event.date)} at ${formatNyTime(event.date)} · ${event.availableTickets} available`,
    }));

  const emailInvalid = formData.email.includes("@") && !formData.email.endsWith(NYC_DOE_EMAIL_SUFFIX);
  const maxTickets = selectedEvent ? Math.min(selectedEvent.availableTickets, MAX_TICKETS) : MAX_TICKETS;

  return (
    <>
      <SiteHeader />
      <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="16">
        <Column maxWidth="s" gap="24">
          <Column gap="8" horizontal="center" align="center">
            <Text variant="label-default-s" onBackground="brand-medium">
              Adult Education
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              AdultEd event registration
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Reserve tickets for an upcoming AdultEd event.
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="32" s={{ padding: "20" }}>
            <form onSubmit={handleSubmit}>
              <Column gap="16">
                <Grid columns="2" gap="16" s={{ columns: 1 }}>
                  <Input id="firstName" name="firstName" label="First name" required autoComplete="given-name" value={formData.firstName} onChange={handleChange} />
                  <Input id="lastName" name="lastName" label="Last name" required autoComplete="family-name" value={formData.lastName} onChange={handleChange} />
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
                    setFieldErrors(prev => ({ ...prev, school: undefined }));
                  }}
                  error={!!fieldErrors.school}
                  errorMessage={fieldErrors.school}
                />
                <Input id="position" name="position" label="Position" required autoComplete="organization-title" value={formData.position} onChange={handleChange} />
                <Select
                  id="eventId"
                  label="Event"
                  options={eventOptions}
                  value={formData.eventId}
                  onSelect={(value) => handleEventSelect(value as string)}
                  emptyState="No AdultEd events are open right now"
                  error={!!fieldErrors.eventId}
                  errorMessage={fieldErrors.eventId}
                />
                {selectedEvent && (
                  <NumberInput
                    id="ticketQuantity"
                    label="Number of tickets"
                    min={1}
                    max={maxTickets}
                    value={parseInt(formData.ticketQuantity) || 1}
                    onChange={(value) => setFormData(prev => ({ ...prev, ticketQuantity: String(value) }))}
                    description={`Up to ${maxTickets} per registration (${selectedEvent.availableTickets} available)`}
                  />
                )}
                <Input id="adultEdNote" name="adultEdNote" label="Note (optional)" value={formData.adultEdNote} onChange={handleChange} />

                {error && <Feedback variant="danger" description={error} />}

                <Row paddingTop="8">
                  <Button type="submit" fillWidth size="l" loading={isSubmitting} disabled={isSubmitting}>
                    {isSubmitting ? "Registering…" : "Register for AdultEd event"}
                  </Button>
                </Row>
              </Column>
            </form>
          </Column>
        </Column>
      </Column>
    </>
  );
}
