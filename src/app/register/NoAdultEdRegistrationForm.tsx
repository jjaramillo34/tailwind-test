"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const SCHOOLS = [
  'P2G MANHATTAN',
  'P2G BROOKLYN',
  'P2G QUEENS',
  'P2G STATEN ISLAND',
  'P2G BRONX',
  'LYFE',
  'RESTART',
  'COOP TECH',
  'PASSAGES BRONX',
  'PASSAGES BROOKLYN',
  'ALC QUEENS',
  'SCHOOL 1',
  'SCHOOL 2',
  'SCHOOL 3',
  'SCHOOL 4',
  'SCHOOL 5',
  'SCHOOL 6',
  'SCHOOL 8',
];

type SelectedEvent = {
  eventId: string;
  event: EventWithProgram;
  ticketQuantity: number;
};

export default function NoAdultEdRegistrationForm({ events }: NoAdultEdRegistrationFormProps) {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'event'>('info');
  
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
    setCurrentStep('event');
  };

  const updateTicketQuantity = (eventId: string, quantity: number) => {
    const numQuantity = parseInt(quantity.toString());
    if (isNaN(numQuantity) || numQuantity < 1) return;

    setSelectedEvents(prev => prev.map(se => {
      if (se.eventId === eventId) {
        const maxTickets = Math.min(se.event.availableTickets, 10);
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
    setIsSubmitting(true);
    
    try {
      if (!formData.email.endsWith("@schools.nyc.gov")) {
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
        if (se.ticketQuantity > 10) {
          validationErrors.push(`${se.event.title}: Maximum 10 tickets per event`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const availableEvents = events.filter(event => event.availableTickets > 0);
  const hasSelectedEvents = selectedEvents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Programs Event Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register for multiple District 79 Programs events at once. Select one or more events and complete your registration in one step.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${currentStep === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'info' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Your Information</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${hasSelectedEvents ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${hasSelectedEvents ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${hasSelectedEvents ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Select Events</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.name@schools.nyc.gov"
                />
                <p className="mt-1 text-xs text-gray-500">Must be a @schools.nyc.gov email address</p>
              </div>
              <div>
                <label htmlFor="school" className="block text-sm font-semibold text-gray-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="school"
                  name="school"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  value={formData.school}
                  onChange={handleChange}
                >
                  <option value="">-- Select your school --</option>
                  {SCHOOLS.sort().map((school: string) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Teacher, Administrator, etc."
                />
              </div>
            </div>
          </div>

          {/* Event Selection Section */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
              Select Events {hasSelectedEvents && <span className="ml-3 text-lg font-normal text-gray-500">({selectedEvents.length} selected)</span>}
            </h2>
            
            <p className="text-gray-600 mb-6">
              Select one or more events by clicking on them. You can register for multiple events at once. 
              <strong className="text-gray-900"> Maximum 10 tickets total per event.</strong>
            </p>

            {/* Selected Events Summary */}
            {hasSelectedEvents && (
              <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Events</h3>
                <div className="space-y-4">
                  {selectedEvents.map(se => (
                    <div key={se.eventId} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{se.event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(se.event.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })} at {new Date(se.event.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{se.event.location}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvent(se.eventId)}
                          className="ml-4 text-red-600 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">
                          Tickets:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={Math.min(se.event.availableTickets, 10)}
                          value={se.ticketQuantity}
                          onChange={(e) => updateTicketQuantity(se.eventId, parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          (Max: {Math.min(se.event.availableTickets, 10)}, Available: {se.event.availableTickets})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEvents.map(event => {
                const isSelected = selectedEvents.some(se => se.eventId === event._id);
                return (
                  <div
                    key={event._id}
                    onClick={() => toggleEventSelection(event)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h4 className="font-bold text-gray-900">{event.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} at {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {event.availableTickets} tickets available
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {availableEvents.length === 0 && (
              <p className="text-gray-500 text-center py-8">No events available at this time.</p>
            )}
          </div>

          {/* Error Messages */}
          {(error || errors.length > 0) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  {error && <p className="text-sm text-red-700 font-medium mb-2">{error}</p>}
                  {errors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-2">Registration Errors:</p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <button
              type="submit"
              disabled={isSubmitting || selectedEvents.length === 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering for {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}...
                </span>
              ) : (
                `Register for ${selectedEvents.length} Event${selectedEvents.length !== 1 ? 's' : ''}`
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting this form, you agree to the terms and conditions of event registration.
              {selectedEvents.length > 0 && (
                <span className="block mt-2">
                  You are registering for <strong>{selectedEvents.length}</strong> event{selectedEvents.length !== 1 ? 's' : ''} with a total of <strong>{selectedEvents.reduce((sum, se) => sum + se.ticketQuantity, 0)}</strong> ticket{selectedEvents.reduce((sum, se) => sum + se.ticketQuantity, 0) !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
