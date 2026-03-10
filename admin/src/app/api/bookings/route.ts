import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateBookingSchema } from '@/schemas';
import { ZodError } from 'zod';

// Generate a unique booking code
function generateBookingCode(): string {
  const prefix = 'BK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const skip = (page - 1) * limit;

    const where = {
      ...(postId ? { post_id: postId } : {}),
      ...(sessionId ? { departure_session_id: sessionId } : {}),
      ...(status ? { booking_status: status as any } : {}),
      ...(source ? { source } : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          departure_session: {
            select: {
              id: true,
              departure_date: true,
              return_date: true,
              label: true,
              final_price: true,
            },
          },
          travelers: true,
        },
        orderBy: [
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, page, limit });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateBookingSchema.parse(body);

    // Generate unique booking code
    let bookingCode = generateBookingCode();
    let codeExists = await prisma.booking.findUnique({ where: { booking_code: bookingCode } });
    while (codeExists) {
      bookingCode = generateBookingCode();
      codeExists = await prisma.booking.findUnique({ where: { booking_code: bookingCode } });
    }

    // Get departure session to check availability
    const session = await prisma.departureSession.findUnique({
      where: { id: data.departure_session_id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
    }

    const seatsAvailable = session.capacity - session.seats_booked;
    if (data.passenger_count > seatsAvailable) {
      return NextResponse.json(
        { error: `Only ${seatsAvailable} seats available` },
        { status: 400 }
      );
    }

    // Create booking with travelers in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          booking_code: bookingCode,
          post_id: data.post_id,
          departure_session_id: data.departure_session_id,
          package_option_id: data.package_option_id ?? null,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          passenger_count: data.passenger_count,
          total_price_snapshot: data.total_price_snapshot,
          currency: data.currency,
          booking_status: data.booking_status,
          payment_status: data.payment_status,
          admin_note: data.admin_note ?? null,
          source: data.source,
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          departure_session: true,
        },
      });

      // Create travelers if provided
      if (data.travelers && data.travelers.length > 0) {
        await tx.traveler.createMany({
          data: data.travelers.map((traveler) => ({
            booking_id: newBooking.id,
            full_name: traveler.full_name,
            gender: traveler.gender ?? null,
            date_of_birth: traveler.date_of_birth ?? null,
            passport_number: traveler.passport_number ?? null,
            nationality: traveler.nationality ?? null,
            phone: traveler.phone ?? null,
            email: traveler.email ?? null,
            emergency_contact: traveler.emergency_contact ?? null,
            special_request: traveler.special_request ?? null,
          })),
        });
      }

      // Update session seats_booked
      await tx.departureSession.update({
        where: { id: data.departure_session_id },
        data: {
          seats_booked: {
            increment: data.passenger_count,
          },
        },
      });

      // Fetch the complete booking with travelers
      return await tx.booking.findUnique({
        where: { id: newBooking.id },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          departure_session: true,
          travelers: true,
        },
      });
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
