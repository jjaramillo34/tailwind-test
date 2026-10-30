import { ProgramLanding } from '@/components/ProgramLanding';

const programsEvents = [
  {
    title: 'MJ The Musical',
    date: 'June 11th',
    time: '2:00 p.m.',
    tickets: 66,
    program: 'No-AdultEd',
  },
  {
    title: 'Harry Potter',
    date: 'May 28th',
    time: '2:00 p.m.',
    tickets: 36,
    program: 'No-AdultEd',
  },
  {
    title: 'Stranger Things',
    date: 'June 4th',
    time: '2:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'One World Observatory',
    date: 'June 13th',
    time: '11:00 a.m. - 1:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'One World Observatory',
    date: 'June 13th',
    time: '1:00 p.m. - 3:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
  {
    title: 'Lion King',
    date: 'May 21st',
    time: '2:00 p.m.',
    tickets: 35,
    program: 'No-AdultEd',
  },
];

export default function ProgramsLanding() {
  return (
    <ProgramLanding
      title="Welcome to Programs Event Registration"
      programLabel="Programs"
      events={programsEvents}
      ctaHref="/register-programs"
      ctaLabel="Register for a Programs event"
    />
  );
}
