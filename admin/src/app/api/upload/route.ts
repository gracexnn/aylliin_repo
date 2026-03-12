import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/auth';
import { generateUploadUrl } from '@/lib/r2';
import { z } from 'zod';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const UploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  fileSize: z.number().int().min(1).max(MAX_FILE_SIZE_BYTES).optional(),
  folder: z.string().optional().default('uploads'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = UploadRequestSchema.parse(body);

    const result = await generateUploadUrl(data.fileName, data.contentType, data.folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
