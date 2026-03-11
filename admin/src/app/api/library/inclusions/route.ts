import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateLibraryInclusionSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const inclusions = await prisma.libraryInclusion.findMany({
      orderBy: [{ active: 'desc' }, { title: 'asc' }],
    });
    return NextResponse.json(inclusions);
  } catch (error) {
    console.error('GET /api/library/inclusions error:', error);
    return NextResponse.json({ error: 'Багтсан зүйлсийг авч чадсангүй' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateLibraryInclusionSchema.parse(body);

    const inclusion = await prisma.libraryInclusion.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        icon: data.icon ?? null,
        active: data.active,
      },
    });

    return NextResponse.json(inclusion, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/library/inclusions error:', error);
    return NextResponse.json({ error: 'Багтсан зүйл үүсгэж чадсангүй' }, { status: 500 });
  }
}
