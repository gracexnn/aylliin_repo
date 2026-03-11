import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { SetPostHighlightsSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const highlights = await prisma.postHighlight.findMany({
      where: { post_id: id },
      orderBy: { order_index: 'asc' },
      include: { highlight: true },
    });
    return NextResponse.json(highlights);
  } catch (error) {
    console.error('GET /api/posts/[id]/highlights error:', error);
    return NextResponse.json({ error: 'Failed to fetch post highlights' }, { status: 500 });
  }
}

/**
 * Replace the full ordered list of highlights for a post.
 * Accepts { items: [{ highlight_id, label_snapshot, order_index }] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: post_id } = await params;
    const body = await request.json();
    const { items } = SetPostHighlightsSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await tx.postHighlight.deleteMany({ where: { post_id } });
      if (items.length > 0) {
        await tx.postHighlight.createMany({
          data: items.map((item) => ({
            post_id,
            highlight_id: item.highlight_id,
            order_index: item.order_index,
            label_snapshot: item.label_snapshot,
          })),
        });
      }
    });

    const updated = await prisma.postHighlight.findMany({
      where: { post_id },
      orderBy: { order_index: 'asc' },
      include: { highlight: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PUT /api/posts/[id]/highlights error:', error);
    return NextResponse.json({ error: 'Failed to update post highlights' }, { status: 500 });
  }
}
