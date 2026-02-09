'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (isBulk && bulkCount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg mb-6">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Registrations Successful! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              You have successfully registered for {bulkCount} event{parseInt(bulkCount) !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Summary</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
              <p className="text-green-800 font-semibold mb-2">✓ All registrations completed successfully!</p>
              <p className="text-green-700 text-sm">
                You will receive confirmation emails for each event. Please check your email for detailed information about each registration.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Total Events Registered:</strong> {bulkCount}
              </p>
              <p className="text-sm text-gray-600">
                If you have any questions about your registrations, please contact Nyesha Green at NGreene4@schools.nyc.gov or Javier Jaramillo at jjaramillo7@schools.nyc.gov.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register-programs"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              Register for More Events
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-all"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't find your registration details. Please check your registration ID or contact support.</p>
          <div className="space-y-3">
            <Link 
              href="/register-programs"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Register for an Event
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const registrationDate = new Date(registration.createdAt);
  const eventDate = new Date(registration.event.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg mb-6">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Registration Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for registering for this event
          </p>
          <p className="text-sm text-gray-500">
            Registration ID: <span className="font-mono font-semibold text-gray-700">{registration.id}</span>
          </p>
        </div>

        {/* Print Button */}
        <div className="text-center mb-8 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-md transition-all"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Confirmation
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Event Information Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 rounded-lg p-3 mr-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{registration.event.title}</h2>
                <p className="text-blue-100 text-lg">{registration.event.description}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Event Date & Time */}
              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Event Date & Time</h3>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-lg text-gray-700">
                  {eventDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
              </div>

              {/* Location */}
              <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">{registration.event.location}</p>
              </div>

              {/* Tickets */}
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tickets Reserved</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{registration.ticketQuantity}</p>
                <p className="text-sm text-gray-600 mt-1">ticket{registration.ticketQuantity !== 1 ? 's' : ''}</p>
              </div>

              {/* Registration Date */}
              <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Registered On</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {registrationDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {registrationDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            {/* Registrant Information */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Registrant Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-medium text-gray-900">
                      {registration.firstName} {registration.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                    <p className="text-lg font-medium text-gray-900 break-all">{registration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">School</p>
                    <p className="text-lg font-medium text-gray-900">{registration.school}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Position</p>
                    <p className="text-lg font-medium text-gray-900">{registration.position}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6 mb-8 print:block">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Important Information</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p>• Please save or print this confirmation for your records.</p>
                <p>• You will receive additional event details via email closer to the event date.</p>
                <p>• If you have any questions, please contact Nyesha Green at NGreene4@schools.nyc.gov or Javier Jaramillo at jjaramillo7@schools.nyc.gov.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          {registration.event.program === 'AdultEd' ? (
            <Link
              href="/register-adulted"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
            >
              Register for Another AdultEd Event
            </Link>
          ) : (
            <Link
              href="/register-programs"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              Register for Another Programs Event
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
