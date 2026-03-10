import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateRoutePointSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateRoutePointSchema.parse(body);

    const point = await prisma.routePoint.create({
      data: {
        route_id: data.route_id,
        order_index: data.order_index,
        latitude: data.latitude,
        longitude: data.longitude,
        name: data.name,
        description: data.description ?? null,
        interesting_fact: data.interesting_fact ?? null,
        recommended_time_to_visit: data.recommended_time_to_visit ?? null,
        images: data.images ?? [],
      },
    });

    return NextResponse.json(point, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/route-points error:', error);
    return NextResponse.json({ error: 'Failed to create route point' }, { status: 500 });
  }
}
