// This file is now deprecated in favor of /register-adulted and /register-programs routes.

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@prisma/client';
import AdultEdRegistrationForm from './AdultEdRegistrationForm';
import NoAdultEdRegistrationForm from './NoAdultEdRegistrationForm';

type EventWithProgram = Event & { program: string };

interface RegistrationFormProps {
  events: EventWithProgram[];
}

export default function RegistrationForm({ events }: RegistrationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    position: '',
    eventId: '',
    ticketQuantity: '1'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithProgram | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState('No-AdultEd');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setIsSubmitting(true);

    try {
      // Validate email domain
      if (!formData.email.endsWith('@schools.nyc.gov')) {
        throw new Error('Please use a valid NYC Department of Education email address (@schools.nyc.gov)');
      }

      // Validate event selection
      if (!selectedEvent) {
        throw new Error('Please select an event');
      }

      // Validate ticket quantity
      const requestedTickets = parseInt(formData.ticketQuantity);
      if (isNaN(requestedTickets) || requestedTickets < 1) {
        throw new Error('Invalid ticket quantity');
      }
      if (requestedTickets > selectedEvent.maxSeats) {
        throw new Error(`Only ${selectedEvent.maxSeats} tickets available for this event`);
      }

      // Log request data
      console.log('Submitting registration:', {
        ...formData,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title
      });

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventId: selectedEvent.id,
          ticketQuantity: parseInt(formData.ticketQuantity)
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.redirectUrl) {
        setDebugInfo('Registration successful, redirecting...');
        router.push(data.redirectUrl);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      setDebugInfo(`Error occurred: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'eventId') {
      const event = events.find(e => e.id.toString() === value);
      setSelectedEvent(event || null);
      console.log('Selected event:', event);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter events by selected program
  const filteredEvents = events.filter(event => event.program === selectedProgram);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Event Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill out the form below to register for the event
          </p>
        </div>
        {/* Program Selector */}
        <div className="mb-4">
          <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
          <select
            id="program"
            name="program"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedProgram}
            onChange={e => {
              setSelectedProgram(e.target.value);
              setSelectedEvent(null);
              setFormData(prev => ({ ...prev, eventId: '' }));
            }}
          >
            <option value="No-AdultEd">No-AdultEd</option>
            <option value="AdultEd">AdultEd</option>
          </select>
        </div>
        {/* Render the correct form based on selected program */}
        {selectedProgram === 'AdultEd' ? (
          <AdultEdRegistrationForm events={filteredEvents} />
        ) : (
          <NoAdultEdRegistrationForm events={filteredEvents} />
        )}
      </div>
    </div>
  );
} 