import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { CreateRoutePointSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateRoutePointSchema.parse(body);

    const [point] = await query(
      `INSERT INTO route_points 
        (route_id, order_index, latitude, longitude, name, description, interesting_fact, recommended_time_to_visit, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.route_id,
        data.order_index,
        data.latitude,
        data.longitude,
        data.name,
        data.description ?? null,
        data.interesting_fact ?? null,
        data.recommended_time_to_visit ?? null,
        data.images ?? [],
      ]
    );

    return NextResponse.json(point, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/route-points error:', error);
    return NextResponse.json({ error: 'Failed to create route point' }, { status: 500 });
  }
}
