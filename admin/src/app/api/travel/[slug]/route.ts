import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.post.findFirst({
      where: { slug, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const routes = await prisma.route.findMany({
      where: { post_id: post.id },
      include: {
        points: { orderBy: { order_index: 'asc' } },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ post, routes });
  } catch (error) {
    console.error('GET /api/travel/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch travel guide' }, { status: 500 });
  }
}
