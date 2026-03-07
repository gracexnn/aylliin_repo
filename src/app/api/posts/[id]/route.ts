import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { UpdatePostSchema } from '@/schemas';
import { ZodError } from 'zod';

const ALLOWED_POST_FIELDS = new Set([
  'title', 'slug', 'cover_image', 'excerpt', 'content', 'published',
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [post] = await query(`SELECT * FROM posts WHERE id = $1`, [id]);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdatePostSchema.parse({ ...body, id });

    const fields = Object.entries(data)
      .filter(([key]) => key !== 'id' && ALLOWED_POST_FIELDS.has(key))
      .filter(([, value]) => value !== undefined);

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map(([key], i) => `${key} = $${i + 2}`).join(', ');
    const values = fields.map(([, value]) => value);

    const [post] = await query(
      `UPDATE posts SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [post] = await query(`DELETE FROM posts WHERE id = $1 RETURNING id`, [id]);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
