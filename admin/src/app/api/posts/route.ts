import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { getAdminSession } from '@/auth';
import { CreatePostSchema } from '@/schemas';
import { ZodError } from 'zod';

function parseBooleanParam(value: string | null) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    const isAdmin = Boolean(session?.user);
    const { searchParams } = new URL(request.url);
    const pageRaw = parseInt(searchParams.get('page') ?? '1');
    const limitRaw = parseInt(searchParams.get('limit') ?? '10');
    const page = pageRaw > 0 ? pageRaw : 1;
    const limit = limitRaw > 0 && limitRaw <= 200 ? limitRaw : 10;
    const skip = (page - 1) * limit;
    const published = parseBooleanParam(searchParams.get('published'));
    const highlighted = parseBooleanParam(searchParams.get('highlighted'));

    const where = {
      ...(isAdmin
        ? typeof published === 'boolean'
          ? { published }
          : {}
        : { published: true }),
      ...(typeof highlighted === 'boolean' ? { highlighted } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [
          { highlighted: 'desc' },
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, page, limit });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreatePostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        cover_image: data.cover_image ?? null,
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,
        journey_overview: data.journey_overview ?? null,
        package_options: data.package_options,
        included_items: data.included_items,
        attraction_items: data.attraction_items,
        itinerary_days: data.itinerary_days,
        travel_tips: data.travel_tips ?? null,
        published: data.published,
        highlighted: data.highlighted,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
