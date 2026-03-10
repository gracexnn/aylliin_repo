import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/db/client';
import { FileText, Map, Plus, TrendingUp } from 'lucide-react';

async function getDashboardStats() {
  try {
    const [total, published, draft] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
    ]);

    return {
      total,
      published,
      draft,
    };
  } catch {
    return { total: 0, published: 0, draft: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Хяналтын самбар</h1>
          <p className="text-muted-foreground mt-1">Аяллын багцуудаа удирдах</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Шинэ багц
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт багц</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Үүсгэсэн аяллын багц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийтлэгдсэн</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Нийтэд харагдаж буй багц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ноорог</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Нийтлээгүй багц</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Түргэн үйлдэл</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/posts">Бүх багцыг үзэх</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/posts/new">Шинэ багц үүсгэх</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
