import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { UpdateRoutePointSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateRoutePointSchema.parse({ ...body, id });

    const fields = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .filter(([, value]) => value !== undefined);

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const values = fields.map(([, value]) => value);

    const [point] = await query(
      `UPDATE route_points SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (!point) {
      return NextResponse.json({ error: 'Route point not found' }, { status: 404 });
    }

    return NextResponse.json(point);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PUT /api/route-points/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update route point' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [point] = await query(
      `DELETE FROM route_points WHERE id = $1 RETURNING id`,
      [id]
    );
    if (!point) {
      return NextResponse.json({ error: 'Route point not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Route point deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/route-points/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete route point' }, { status: 500 });
  }
}
