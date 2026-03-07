import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routes = await query(
      `SELECT r.*, 
        json_agg(
          json_build_object(
            'id', rp.id,
            'route_id', rp.route_id,
            'order_index', rp.order_index,
            'latitude', rp.latitude,
            'longitude', rp.longitude,
            'name', rp.name,
            'description', rp.description,
            'interesting_fact', rp.interesting_fact,
            'recommended_time_to_visit', rp.recommended_time_to_visit,
            'images', rp.images
          ) ORDER BY rp.order_index
        ) FILTER (WHERE rp.id IS NOT NULL) as points
       FROM routes r
       LEFT JOIN route_points rp ON rp.route_id = r.id
       WHERE r.post_id = $1
       GROUP BY r.id
       ORDER BY r.created_at`,
      [id]
    );

    return NextResponse.json(routes);
  } catch (error) {
    console.error('GET route data error:', error);
    return NextResponse.json({ error: 'Failed to fetch route data' }, { status: 500 });
  }
}
