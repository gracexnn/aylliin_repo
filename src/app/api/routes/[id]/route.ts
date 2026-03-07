import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { UpdateRouteSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [route] = await query(`SELECT * FROM routes WHERE id = $1`, [id]);
    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    const points = await query(
      `SELECT * FROM route_points WHERE route_id = $1 ORDER BY order_index`,
      [id]
    );

    return NextResponse.json({ ...route, points });
  } catch (error) {
    console.error('GET /api/routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateRouteSchema.parse({ ...body, id });

    if (data.title) {
      const [route] = await query(
        `UPDATE routes SET title = $2 WHERE id = $1 RETURNING *`,
        [id, data.title]
      );
      if (!route) {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 });
      }
      return NextResponse.json(route);
    }

    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PUT /api/routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [route] = await query(`DELETE FROM routes WHERE id = $1 RETURNING id`, [id]);
    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/routes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
