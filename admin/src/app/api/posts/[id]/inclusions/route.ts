import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { SetPostInclusionsSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inclusions = await prisma.postInclusion.findMany({
      where: { post_id: id },
      orderBy: { order_index: 'asc' },
      include: { inclusion: true },
    });
    return NextResponse.json(inclusions);
  } catch (error) {
    console.error('GET /api/posts/[id]/inclusions error:', error);
    return NextResponse.json({ error: 'Failed to fetch post inclusions' }, { status: 500 });
  }
}

/**
 * Replace the full ordered list of inclusions for a post.
 * Accepts { items: [{ inclusion_id, label_snapshot, order_index }] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: post_id } = await params;
    const body = await request.json();
    const { items } = SetPostInclusionsSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await tx.postInclusion.deleteMany({ where: { post_id } });
      if (items.length > 0) {
        await tx.postInclusion.createMany({
          data: items.map((item) => ({
            post_id,
            inclusion_id: item.inclusion_id,
            order_index: item.order_index,
            label_snapshot: item.label_snapshot,
          })),
        });
      }
    });

    const updated = await prisma.postInclusion.findMany({
      where: { post_id },
      orderBy: { order_index: 'asc' },
      include: { inclusion: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PUT /api/posts/[id]/inclusions error:', error);
    return NextResponse.json({ error: 'Failed to update post inclusions' }, { status: 500 });
  }
}
