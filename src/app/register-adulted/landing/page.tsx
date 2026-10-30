import { ProgramLanding } from '@/components/ProgramLanding';

const adultEdEvents = [
  {
    title: 'Hells Kitchen (Evening)',
    date: 'June 4th',
    time: '7:30 p.m.',
    tickets: 46,
    program: 'AdultEd',
  },
  {
    title: 'Group Trip (Evening)',
    date: 'June 13th',
    time: '6:00 p.m.',
    tickets: 75,
    program: 'AdultEd',
  },
  {
    title: 'Death Becomes Her (Evening)',
    date: 'May 21st',
    time: '7:30 p.m.',
    tickets: 55,
    program: 'AdultEd',
  },
];

export default function AdultEdLanding() {
  return (
    <ProgramLanding
      title="Welcome to AdultEd Event Registration"
      programLabel="AdultEd"
      events={adultEdEvents}
      ctaHref="/register-adulted"
      ctaLabel="Register for an AdultEd event"
    />
  );
}
