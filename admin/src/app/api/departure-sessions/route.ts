import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateDepartureSessionSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const skip = (page - 1) * limit;

    const where = {
      ...(postId ? { post_id: postId } : {}),
      ...(status ? { status: status as any } : {}),
    };

    const [sessions, total] = await Promise.all([
      prisma.departureSession.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: [
          { departure_date: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.departureSession.count({ where }),
    ]);

    return NextResponse.json({ sessions, total, page, limit });
  } catch (error) {
    console.error('GET /api/departure-sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch departure sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateDepartureSessionSchema.parse(body);

    // Calculate final price
    let finalPrice = data.base_price;
    if (data.discount_type && data.discount_value) {
      if (data.discount_type === 'FIXED') {
        finalPrice = data.base_price - data.discount_value;
      } else if (data.discount_type === 'PERCENT') {
        finalPrice = data.base_price - (data.base_price * data.discount_value / 100);
      }
    }

    const session = await prisma.departureSession.create({
      data: {
        post_id: data.post_id,
        package_option_id: data.package_option_id ?? null,
        departure_date: data.departure_date,
        return_date: data.return_date ?? null,
        label: data.label,
        base_price: data.base_price,
        currency: data.currency,
        discount_type: data.discount_type ?? null,
        discount_value: data.discount_value ?? null,
        discount_reason: data.discount_reason ?? null,
        final_price: finalPrice,
        capacity: data.capacity,
        status: data.status,
        public_note: data.public_note ?? null,
        internal_note: data.internal_note ?? null,
      },
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

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('POST /api/departure-sessions error:', error);
    return NextResponse.json({ error: 'Failed to create departure session' }, { status: 500 });
  }
}
