import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateLibraryHighlightSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const highlight = await prisma.libraryHighlight.findUnique({ where: { id } });
    if (!highlight) {
      return NextResponse.json({ error: 'Онцлох зүйл олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json(highlight);
  } catch (error) {
    console.error('GET /api/library/highlights/[id] error:', error);
    return NextResponse.json({ error: 'Онцлох зүйлийг авч чадсангүй' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateLibraryHighlightSchema.parse({ ...body, id });

    const { id: _id, ...updateFields } = data;
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'Шинэчлэх талбар алга' }, { status: 400 });
    }

    const highlight = await prisma.libraryHighlight.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json(highlight);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Онцлох зүйл олдсонгүй' }, { status: 404 });
    }
    console.error('PUT /api/library/highlights/[id] error:', error);
    return NextResponse.json({ error: 'Онцлох зүйлийг шинэчилж чадсангүй' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.libraryHighlight.delete({ where: { id } });
    return NextResponse.json({ message: 'Онцлох зүйлийг амжилттай устгалаа' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Онцлох зүйл олдсонгүй' }, { status: 404 });
    }
    console.error('DELETE /api/library/highlights/[id] error:', error);
    return NextResponse.json({ error: 'Онцлох зүйлийг устгаж чадсангүй' }, { status: 500 });
  }
}
