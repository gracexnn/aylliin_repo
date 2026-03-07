import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { CreatePostSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = (page - 1) * limit;

    const posts = await query(
      `SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = await query<{ count: string }>(`SELECT COUNT(*) as count FROM posts`);

    return NextResponse.json({
      posts,
      total: parseInt(total[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreatePostSchema.parse(body);

    const [post] = await query(
      `INSERT INTO posts (title, slug, cover_image, excerpt, content, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.title, data.slug, data.cover_image ?? null, data.excerpt ?? null, data.content ?? null, data.published]
    );

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
