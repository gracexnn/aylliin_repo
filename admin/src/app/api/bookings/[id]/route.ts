import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateBookingSchema, TravelerSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { z } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            package_options: true,
          },
        },
        departure_session: true,
        travelers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateBookingSchema.parse({ ...body, id });

    const { id: _id, booking_code: _code, travelers: newTravelers, ...updateFields } = data;

    // Get current booking
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      include: { travelers: true },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if passenger_count is being changed
    const passengerCountChanged =
      updateFields.passenger_count !== undefined &&
      updateFields.passenger_count !== currentBooking.passenger_count;

    if (passengerCountChanged) {
      const session = await prisma.departureSession.findUnique({
        where: { id: currentBooking.departure_session_id },
      });

      if (!session) {
        return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
      }

      const newCount = updateFields.passenger_count!;
      const countDiff = newCount - currentBooking.passenger_count;
      const seatsAvailable = session.capacity - session.seats_booked;

      if (countDiff > seatsAvailable) {
        return NextResponse.json(
          { error: `Only ${seatsAvailable} additional seats available` },
          { status: 400 }
        );
      }
    }

    // Update booking and travelers in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Update booking fields
      if (Object.keys(updateFields).length > 0) {
        await tx.booking.update({
          where: { id },
          data: updateFields,
        });
      }

      // Update seats_booked if passenger_count changed
      if (passengerCountChanged) {
        const countDiff = updateFields.passenger_count! - currentBooking.passenger_count;
        await tx.departureSession.update({
          where: { id: currentBooking.departure_session_id },
          data: {
            seats_booked: {
              increment: countDiff,
            },
          },
        });

        // If seats increased, check if session should become FULL
        if (countDiff > 0) {
          const updatedSession = await tx.departureSession.findUnique({
            where: { id: currentBooking.departure_session_id },
            select: { capacity: true, seats_booked: true },
          });
          if (updatedSession && updatedSession.seats_booked >= updatedSession.capacity) {
            await tx.departureSession.updateMany({
              where: { id: currentBooking.departure_session_id, status: 'OPEN' },
              data: { status: 'FULL' },
            });
          }
        }

        // If seats decreased, check if session should reopen (FULL -> OPEN)
        if (countDiff < 0) {
          const sessionAfterUpdate = await tx.departureSession.findUnique({
            where: { id: currentBooking.departure_session_id },
            select: { capacity: true, seats_booked: true, status: true },
          });
          if (
            sessionAfterUpdate &&
            sessionAfterUpdate.status === 'FULL' &&
            sessionAfterUpdate.seats_booked < sessionAfterUpdate.capacity
          ) {
            await tx.departureSession.update({
              where: { id: currentBooking.departure_session_id },
              data: { status: 'OPEN' },
            });
          }
        }
      }

      // Handle travelers update if provided
      if (newTravelers !== undefined && Array.isArray(newTravelers)) {
        // Delete existing travelers
        await tx.traveler.deleteMany({
          where: { booking_id: id },
        });

        // Create new travelers
        if (newTravelers.length > 0) {
          await tx.traveler.createMany({
            data: newTravelers.map((traveler) => ({
              booking_id: id,
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
      }

      // Fetch updated booking
      return await tx.booking.findUnique({
        where: { id },
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

    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    console.error('PUT /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        departure_session_id: true,
        passenger_count: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Delete booking and update seats in transaction
    await prisma.$transaction(async (tx) => {
      // Delete booking (travelers will be cascade deleted)
      await tx.booking.delete({ where: { id } });

      // Update session seats_booked
      await tx.departureSession.update({
        where: { id: booking.departure_session_id },
        data: {
          seats_booked: {
            decrement: booking.passenger_count,
          },
        },
      });

      // Re-open the session if it was FULL and now has available capacity
      const sessionAfterDelete = await tx.departureSession.findUnique({
        where: { id: booking.departure_session_id },
        select: { capacity: true, seats_booked: true, status: true },
      });
      if (
        sessionAfterDelete &&
        sessionAfterDelete.status === 'FULL' &&
        sessionAfterDelete.seats_booked < sessionAfterDelete.capacity
      ) {
        await tx.departureSession.update({
          where: { id: booking.departure_session_id },
          data: { status: 'OPEN' },
        });
      }
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    console.error('DELETE /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
