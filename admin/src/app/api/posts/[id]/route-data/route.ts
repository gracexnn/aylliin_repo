import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routes = await prisma.route.findMany({
      where: { post_id: id },
      include: {
        points: { orderBy: { order_index: 'asc' } },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('GET route data error:', error);
    return NextResponse.json({ error: 'Failed to fetch route data' }, { status: 500 });
  }
}
