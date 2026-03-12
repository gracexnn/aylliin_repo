import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/auth';
import prisma from '@/db/client';
import { LandingSettingsSchema } from '@/schemas';
import { ZodError } from 'zod';

// Singleton row – always upserted with this fixed ID.
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Нэвтрэх эрхгүй байна' }, { status: 401 });
  }

  const settings = await prisma.landingPageSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  return NextResponse.json(settings ?? {});
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Нэвтрэх эрхгүй байна' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON задлах алдаа гарлаа' }, { status: 400 });
  }

  let data: ReturnType<typeof LandingSettingsSchema.parse>;
  try {
    data = LandingSettingsSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Баталгаажуулалтын алдаа', details: err.flatten().fieldErrors },
        { status: 422 },
      );
    }
    throw err;
  }

  // Sanitize: trim all string values to prevent leading/trailing whitespace
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]),
  );

  const settings = await prisma.landingPageSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...sanitized,
      updated_by: session.user?.email ?? null,
    },
    update: {
      ...sanitized,
      updated_by: session.user?.email ?? null,
    },
  });

  return NextResponse.json(settings);
}
