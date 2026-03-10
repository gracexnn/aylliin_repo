import { NextRequest, NextResponse } from 'next/server';
import { generateUploadUrl } from '@/lib/r2';
import { z } from 'zod';

const UploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional().default('uploads'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = UploadRequestSchema.parse(body);

    const result = await generateUploadUrl(data.fileName, data.contentType, data.folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
