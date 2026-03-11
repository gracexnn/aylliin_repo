import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateLibraryLocationSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await prisma.libraryLocation.findUnique({ where: { id } });
    if (!location) {
      return NextResponse.json({ error: 'Байршил олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json(location);
  } catch (error) {
    console.error('GET /api/library/locations/[id] error:', error);
    return NextResponse.json({ error: 'Байршлыг авч чадсангүй' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateLibraryLocationSchema.parse({ ...body, id });

    const { id: _id, ...updateFields } = data;
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'Шинэчлэх талбар алга' }, { status: 400 });
    }

    const location = await prisma.libraryLocation.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Байршил олдсонгүй' }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ийм slug аль хэдийн байна' }, { status: 409 });
    }
    console.error('PUT /api/library/locations/[id] error:', error);
    return NextResponse.json({ error: 'Байршлыг шинэчилж чадсангүй' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.libraryLocation.delete({ where: { id } });
    return NextResponse.json({ message: 'Байршлыг амжилттай устгалаа' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Байршил олдсонгүй' }, { status: 404 });
    }
    console.error('DELETE /api/library/locations/[id] error:', error);
    return NextResponse.json({ error: 'Байршлыг устгаж чадсангүй' }, { status: 500 });
  }
}
