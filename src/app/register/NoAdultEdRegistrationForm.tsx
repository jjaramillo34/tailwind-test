"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Event } from "@prisma/client";

type EventWithProgram = Event & { 
  program: string;
  availableTickets: number;
};

interface NoAdultEdRegistrationFormProps {
  events: EventWithProgram[];
}

export default function NoAdultEdRegistrationForm({ events }: NoAdultEdRegistrationFormProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    position: "",
    eventId: "",
    ticketQuantity: "1"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithProgram | null>(null);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (!formData.email.endsWith("@schools.nyc.gov")) {
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
      if (requestedTickets > 10) {
        throw new Error('You can request a maximum of 10 tickets per registration');
      }
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: selectedEvent.id,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "eventId") {
      const event = events.find(e => e.id.toString() === value);
      setSelectedEvent(event || null);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">New Event Registration</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input id="firstName" name="firstName" type="text" required className="mt-1 block w-full" value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input id="lastName" name="lastName" type="text" required className="mt-1 block w-full" value={formData.lastName} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700">School Name</label>
              <input id="school" name="school" type="text" required className="mt-1 block w-full" value={formData.school} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
              <input id="position" name="position" type="text" required className="mt-1 block w-full" value={formData.position} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-700">Select Event</label>
              <select id="eventId" name="eventId" required className="mt-1 block w-full" value={formData.eventId} onChange={handleChange}>
                <option value="">Select an event</option>
                {events.filter(event => event.availableTickets > 0).map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Available: {event.availableTickets})
                  </option>
                ))}
              </select>
            </div>
            {selectedEvent && (
              <div>
                <label htmlFor="ticketQuantity" className="block text-sm font-medium text-gray-700">Number of Tickets</label>
                <input id="ticketQuantity" name="ticketQuantity" type="number" min="1" max={Math.min(selectedEvent.availableTickets, 10)} required className="mt-1 block w-full" value={formData.ticketQuantity} onChange={handleChange} />
                <p className="mt-1 text-sm text-gray-500">Maximum {Math.min(selectedEvent.availableTickets, 10)} tickets per registration (event has {selectedEvent.availableTickets} available)</p>
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm text-center p-4 bg-red-50 rounded-md">{error}</div>}
          <div>
            <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md">
              {isSubmitting ? "Registering..." : "Register for New Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 