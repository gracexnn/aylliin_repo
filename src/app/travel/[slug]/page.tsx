import { notFound } from 'next/navigation';
import TravelGuideClient from '@/components/travel-guide-client';

interface TravelPageProps {
  params: Promise<{ slug: string }>;
}

async function getTravelGuide(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/travel/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TravelPage({ params }: TravelPageProps) {
  const { slug } = await params;
  const data = await getTravelGuide(slug);

  if (!data || !data.post) {
    notFound();
  }

  return <TravelGuideClient post={data.post} routes={data.routes} />;
}
