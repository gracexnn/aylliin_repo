import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/client';
import { UpdateRoutePointSchema } from '@/schemas';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = UpdateRoutePointSchema.parse({ ...body, id });

    const { id: _id, ...updateFields } = data;
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const point = await prisma.routePoint.update({
      where: { id },
      data: updateFields,
    });

    return NextResponse.json(point);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Route point not found' }, { status: 404 });
    }
    console.error('PUT /api/route-points/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update route point' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.routePoint.delete({ where: { id } });
    return NextResponse.json({ message: 'Route point deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Route point not found' }, { status: 404 });
    }
    console.error('DELETE /api/route-points/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete route point' }, { status: 500 });
  }
}
