import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { CreateLibraryLocationSchema } from '@/schemas';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const locations = await prisma.libraryLocation.findMany({
      where: active === 'true' ? { active: true } : undefined,
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error('GET /api/library/locations error:', error);
    return NextResponse.json({ error: 'Байршлуудыг авч чадсангүй' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateLibraryLocationSchema.parse(body);

    const location = await prisma.libraryLocation.create({
      data: {
        name: data.name,
        slug: data.slug,
        short_description: data.short_description ?? null,
        description: data.description ?? null,
        latitude: data.latitude,
        longitude: data.longitude,
        cover_image: data.cover_image ?? null,
        gallery: data.gallery ?? [],
        region: data.region ?? null,
        country: data.country ?? null,
        tags: data.tags ?? [],
        active: data.active,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/library/locations error:', error);
    return NextResponse.json({ error: 'Байршил үүсгэж чадсангүй' }, { status: 500 });
  }
}
