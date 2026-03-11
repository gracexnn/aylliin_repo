import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateLibraryHighlightSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const highlights = await prisma.libraryHighlight.findMany({
      orderBy: [{ active: 'desc' }, { title: 'asc' }],
    });
    return NextResponse.json(highlights);
  } catch (error) {
    console.error('GET /api/library/highlights error:', error);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateLibraryHighlightSchema.parse(body);

    const highlight = await prisma.libraryHighlight.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        active: data.active,
      },
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/library/highlights error:', error);
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}
