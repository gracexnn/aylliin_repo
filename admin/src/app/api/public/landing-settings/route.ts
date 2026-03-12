import { NextResponse } from 'next/server';
import prisma from '@/db/client';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'production'
      ? (process.env.CLIENT_ORIGIN ?? 'https://aylal-client.vercel.app')
      : '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const settings = await prisma.landingPageSettings.findUnique({
      where: { id: SETTINGS_ID },
      // exclude internal audit fields from public response
      select: {
        hero_title: true,
        hero_subtitle: true,
        hero_primary_cta_text: true,
        hero_primary_cta_url: true,
        hero_secondary_cta_text: true,
        hero_secondary_cta_url: true,
        contact_email: true,
        contact_phone: true,
        contact_address: true,
        contact_whatsapp: true,
        facebook_url: true,
        instagram_url: true,
        linkedin_url: true,
        announcement_text: true,
        footer_blurb: true,
        meta_title: true,
        meta_description: true,
        og_image_url: true,
        updated_at: true,
      },
    });

    return NextResponse.json(settings ?? {}, {
      headers: {
        ...corsHeaders,
        // Cache for 5 minutes on CDN, stale-while-revalidate for 1 minute
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch landing settings:', error);
    return NextResponse.json(
      { error: 'Тохиргоог авч чадсангүй' },
      { status: 500, headers: corsHeaders },
    );
  }
}
