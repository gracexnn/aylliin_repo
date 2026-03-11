import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateLibraryInclusionSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inclusion = await prisma.libraryInclusion.findUnique({ where: { id } });
    if (!inclusion) {
      return NextResponse.json({ error: 'Inclusion not found' }, { status: 404 });
    }
    return NextResponse.json(inclusion);
  } catch (error) {
    console.error('GET /api/library/inclusions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch inclusion' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateLibraryInclusionSchema.parse({ ...body, id });

    const { id: _id, ...updateFields } = data;
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const inclusion = await prisma.libraryInclusion.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json(inclusion);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Inclusion not found' }, { status: 404 });
    }
    console.error('PUT /api/library/inclusions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update inclusion' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.libraryInclusion.delete({ where: { id } });
    return NextResponse.json({ message: 'Inclusion deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Inclusion not found' }, { status: 404 });
    }
    console.error('DELETE /api/library/inclusions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete inclusion' }, { status: 500 });
  }
}
