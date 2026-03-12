import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateDepartureSessionSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.departureSession.findUnique({
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
        bookings: {
          select: {
            id: true,
            booking_code: true,
            contact_name: true,
            passenger_count: true,
            booking_status: true,
            payment_status: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('GET /api/departure-sessions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch departure session' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateDepartureSessionSchema.parse({ ...body, id });

    const { id: _id, seats_booked: _seats, ...updateFields } = data;
    
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Recalculate final price if pricing fields are updated
    if ('base_price' in updateFields || 'discount_type' in updateFields || 'discount_value' in updateFields) {
      const current = await prisma.departureSession.findUnique({ where: { id } });
      if (!current) {
        return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
      }

      const basePrice = updateFields.base_price ?? current.base_price;
      const discountType = updateFields.discount_type !== undefined ? updateFields.discount_type : current.discount_type;
      const discountValue = updateFields.discount_value !== undefined ? updateFields.discount_value : current.discount_value;

      let finalPrice = Number(basePrice);
      if (discountType && discountValue) {
        if (discountType === 'FIXED') {
          finalPrice = Number(basePrice) - Number(discountValue);
        } else if (discountType === 'PERCENT') {
          if (Number(discountValue) > 100) {
            return NextResponse.json({ error: 'Percent discount cannot exceed 100%' }, { status: 400 });
          }
          finalPrice = Number(basePrice) - (Number(basePrice) * Number(discountValue) / 100);
        }
      }
      if (finalPrice < 0) {
        return NextResponse.json({ error: 'Discount results in a negative price' }, { status: 400 });
      }
      updateFields.final_price = finalPrice;
    }

    const session = await prisma.departureSession.update({
      where: { id },
      data: updateFields,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
    }
    console.error('PUT /api/departure-sessions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update departure session' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if there are any bookings
    const bookingCount = await prisma.booking.count({
      where: { departure_session_id: id },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete session with existing bookings' },
        { status: 400 }
      );
    }

    await prisma.departureSession.delete({ where: { id } });
    return NextResponse.json({ message: 'Departure session deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Departure session not found' }, { status: 404 });
    }
    console.error('DELETE /api/departure-sessions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete departure session' }, { status: 500 });
  }
}
