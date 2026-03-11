import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/db/client';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://aylal-client.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SiteVisitSchema = z.object({
  visitor_id: z.string().min(8).max(100),
  path: z.string().min(1).max(500).refine((value) => value.startsWith('/'), {
    message: 'Path must start with /',
  }),
  referrer: z.string().max(1000).optional().nullable(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitor_id, path, referrer } = SiteVisitSchema.parse(body);
    const userAgent = req.headers.get('user-agent');

    await prisma.$executeRaw`
      INSERT INTO site_visits (id, visitor_id, path, referrer, user_agent, created_at)
      VALUES (${randomUUID()}::uuid, ${visitor_id}, ${path}, ${referrer ?? null}, ${userAgent}, NOW())
    `;

    return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('Site visit tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to record site visit' },
      { status: 500, headers: corsHeaders }
    );
  }
}
