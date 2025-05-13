import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await prisma.eventsRegistration.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        event: true
      }
    });

    if (!registration) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { message: 'Error fetching registration details' },
      { status: 500 }
    );
  }
} 