import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { getAdminSession } from '@/auth';
import { CreateDepartureSessionSchema } from '@/schemas';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    const isAdmin = Boolean(session?.user);
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const pageRaw = parseInt(searchParams.get('page') ?? '1');
    const limitParam = searchParams.get('limit') ?? '50';
    const limitRaw = parseInt(limitParam);
    const isUnlimited = limitParam.toLowerCase() === 'all';
    const page = pageRaw > 0 ? pageRaw : 1;
    const limit = isUnlimited ? 0 : (limitRaw > 0 && limitRaw <= 200 ? limitRaw : 50);
    const skip = (page - 1) * limit;

    let monthFilter: Prisma.DateTimeFilter | undefined;
    if (month) {
      const monthMatch = /^(\d{4})-(\d{2})$/.exec(month);
      if (!monthMatch) {
        return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400 });
      }

      const year = Number(monthMatch[1]);
      const monthIndex = Number(monthMatch[2]) - 1;
      if (monthIndex < 0 || monthIndex > 11) {
        return NextResponse.json({ error: 'Invalid month value. Use 01-12' }, { status: 400 });
      }

      const start = new Date(Date.UTC(year, monthIndex, 1));
      const end = new Date(Date.UTC(year, monthIndex + 1, 1));
      monthFilter = { gte: start, lt: end };
    }

    const where: Prisma.DepartureSessionWhereInput = {
      ...(postId ? { post_id: postId } : {}),
      ...(isAdmin ? (status ? { status: status as 'DRAFT' | 'OPEN' | 'FULL' | 'CANCELLED' } : {}) : { status: 'OPEN' as const }),
      ...(monthFilter ? { departure_date: monthFilter } : {}),
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
        ...(isUnlimited ? {} : { skip, take: limit }),
      }),
      prisma.departureSession.count({ where }),
    ]);

    const normalizedSessions = isAdmin
      ? sessions
      : sessions.map((session) => ({
          ...session,
          internal_note: null,
        }));

    return NextResponse.json({ sessions: normalizedSessions, total, page, limit: isUnlimited ? null : limit });
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
        if (data.discount_value > 100) {
          return NextResponse.json({ error: 'Percent discount cannot exceed 100%' }, { status: 400 });
        }
        finalPrice = data.base_price - (data.base_price * data.discount_value / 100);
      }
    }
    if (finalPrice < 0) {
      return NextResponse.json({ error: 'Discount results in a negative price' }, { status: 400 });
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
