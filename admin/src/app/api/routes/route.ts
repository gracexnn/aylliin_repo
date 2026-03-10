import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateRouteSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateRouteSchema.parse(body);

    const route = await prisma.route.create({
      data: { post_id: data.post_id, title: data.title },
    });

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/routes error:', error);
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}
