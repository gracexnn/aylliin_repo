import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/db/client';
import { cn, formatDate } from '@/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  Globe,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';

type VisitSummaryRow = {
  total_views: bigint;
  unique_visitors: bigint;
  today_views: bigint;
  week_views: bigint;
};

type VisitPathRow = {
  path: string;
  views: bigint;
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Хүлээгдэж буй',
  CONFIRMED: 'Баталгаажсан',
  CANCELLED: 'Цуцлагдсан',
  COMPLETED: 'Дууссан',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Төлөөгүй',
  PARTIAL: 'Хэсэгчлэн төлсөн',
  PAID: 'Төлсөн',
  REFUNDED: 'Буцаасан',
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Ноорог',
  OPEN: 'Нээлттэй',
  FULL: 'Дүүрсэн',
  CANCELLED: 'Цуцлагдсан',
};

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatCurrency(value: number, currency = 'MNT') {
  return `${currency} ${value.toLocaleString()}`;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatPathLabel(path: string) {
  if (path === '/') {
    return 'Нүүр хуудас';
  }

  return path;
}

function getMonthBuckets() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
      revenue: 0,
    };
  });
}

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      highlightedPosts,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      paidBookings,
      unpaidBookings,
      totalSessions,
      openSessions,
      fullSessions,
      cancelledSessions,
      upcomingSessionsCount,
      bookingAggregate,
      seatAggregate,
      recentBookings,
      upcomingSessions,
      recentBookingActivity,
      postsOverview,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.post.count({ where: { highlighted: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { booking_status: 'PENDING' } }),
      prisma.booking.count({ where: { booking_status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { booking_status: 'COMPLETED' } }),
      prisma.booking.count({ where: { payment_status: 'PAID' } }),
      prisma.booking.count({ where: { payment_status: 'UNPAID' } }),
      prisma.departureSession.count(),
      prisma.departureSession.count({ where: { status: 'OPEN' } }),
      prisma.departureSession.count({ where: { status: 'FULL' } }),
      prisma.departureSession.count({ where: { status: 'CANCELLED' } }),
      prisma.departureSession.count({
        where: {
          departure_date: { gte: today },
          status: { in: ['OPEN', 'FULL'] },
        },
      }),
      prisma.booking.aggregate({
        _sum: {
          total_price_snapshot: true,
          passenger_count: true,
        },
      }),
      prisma.departureSession.aggregate({
        where: {
          status: { not: 'CANCELLED' },
        },
        _sum: {
          capacity: true,
          seats_booked: true,
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          booking_code: true,
          contact_name: true,
          passenger_count: true,
          total_price_snapshot: true,
          currency: true,
          booking_status: true,
          payment_status: true,
          created_at: true,
          post: {
            select: {
              title: true,
            },
          },
          departure_session: {
            select: {
              departure_date: true,
              label: true,
            },
          },
        },
      }),
      prisma.departureSession.findMany({
        take: 5,
        where: {
          departure_date: { gte: today },
          status: { in: ['OPEN', 'FULL'] },
        },
        orderBy: { departure_date: 'asc' },
        select: {
          id: true,
          label: true,
          departure_date: true,
          return_date: true,
          final_price: true,
          currency: true,
          capacity: true,
          seats_booked: true,
          status: true,
          post: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          created_at: { gte: sixMonthsAgo },
        },
        select: {
          created_at: true,
          total_price_snapshot: true,
        },
      }),
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          highlighted: true,
          updated_at: true,
          _count: {
            select: {
              bookings: true,
              departure_sessions: true,
            },
          },
        },
      }),
    ]);

    const monthlyBookings = getMonthBuckets();
    const monthIndex = new Map(monthlyBookings.map((item) => [item.key, item]));

    recentBookingActivity.forEach((booking) => {
      const date = new Date(booking.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = monthIndex.get(key);

      if (bucket) {
        bucket.count += 1;
        bucket.revenue += toNumber(booking.total_price_snapshot);
      }
    });

    const topPosts = [...postsOverview]
      .sort((a, b) => {
        if (b._count.bookings !== a._count.bookings) {
          return b._count.bookings - a._count.bookings;
        }

        if (b._count.departure_sessions !== a._count.departure_sessions) {
          return b._count.departure_sessions - a._count.departure_sessions;
        }

        return b.updated_at.getTime() - a.updated_at.getTime();
      })
      .slice(0, 4);

    const totalCapacity = seatAggregate._sum.capacity ?? 0;
    const totalBookedSeats = seatAggregate._sum.seats_booked ?? 0;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0;
    const totalRevenue = toNumber(bookingAggregate._sum.total_price_snapshot);
    const totalPassengers = bookingAggregate._sum.passenger_count ?? 0;
    const conversionRate = totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0;

    const attentionItems = [
      {
        label: 'Ноорог багц',
        value: draftPosts,
        href: '/dashboard/posts',
      },
      {
        label: 'Хүлээгдэж буй захиалга',
        value: pendingBookings,
        href: '/dashboard/bookings',
      },
      {
        label: 'Төлөөгүй захиалга',
        value: unpaidBookings,
        href: '/dashboard/bookings',
      },
      {
        label: 'Удахгүй гарах тов',
        value: upcomingSessionsCount,
        href: '/dashboard/departure-sessions',
      },
    ].filter((item) => item.value > 0);

    let visits = {
      totalViews: 0,
      uniqueVisitors: 0,
      todayViews: 0,
      weekViews: 0,
      topPaths: [] as Array<{ path: string; views: number }>,
    };

    try {
      const [visitSummary] = await prisma.$queryRaw<VisitSummaryRow[]>`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= ${thirtyDaysAgo})::bigint AS total_views,
          COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= ${thirtyDaysAgo})::bigint AS unique_visitors,
          COUNT(*) FILTER (WHERE created_at >= ${today})::bigint AS today_views,
          COUNT(*) FILTER (WHERE created_at >= ${sevenDaysAgo})::bigint AS week_views
        FROM site_visits
      `;

      const topPaths = await prisma.$queryRaw<VisitPathRow[]>`
        SELECT path, COUNT(*)::bigint AS views
        FROM site_visits
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY path
        ORDER BY views DESC, path ASC
        LIMIT 5
      `;

      visits = {
        totalViews: Number(visitSummary?.total_views ?? 0),
        uniqueVisitors: Number(visitSummary?.unique_visitors ?? 0),
        todayViews: Number(visitSummary?.today_views ?? 0),
        weekViews: Number(visitSummary?.week_views ?? 0),
        topPaths: topPaths.map((item) => ({
          path: item.path,
          views: Number(item.views),
        })),
      };
    } catch {
      visits = {
        totalViews: 0,
        uniqueVisitors: 0,
        todayViews: 0,
        weekViews: 0,
        topPaths: [],
      };
    }

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        highlighted: highlightedPosts,
        conversionRate,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        paid: paidBookings,
        unpaid: unpaidBookings,
        totalRevenue,
        totalPassengers,
      },
      sessions: {
        total: totalSessions,
        open: openSessions,
        full: fullSessions,
        cancelled: cancelledSessions,
        upcoming: upcomingSessionsCount,
        occupancyRate,
        totalCapacity,
        totalBookedSeats,
      },
      recentBookings,
      upcomingSessions,
      monthlyBookings,
      topPosts,
      attentionItems,
      visits,
    };
  } catch {
    return {
      posts: {
        total: 0,
        published: 0,
        draft: 0,
        highlighted: 0,
        conversionRate: 0,
      },
      bookings: {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        paid: 0,
        unpaid: 0,
        totalRevenue: 0,
        totalPassengers: 0,
      },
      sessions: {
        total: 0,
        open: 0,
        full: 0,
        cancelled: 0,
        upcoming: 0,
        occupancyRate: 0,
        totalCapacity: 0,
        totalBookedSeats: 0,
      },
      recentBookings: [],
      upcomingSessions: [],
      monthlyBookings: getMonthBuckets(),
      topPosts: [],
      attentionItems: [],
      visits: {
        totalViews: 0,
        uniqueVisitors: 0,
        todayViews: 0,
        weekViews: 0,
        topPaths: [],
      },
    };
  }
}

function StatCard({
  title,
  value,
  description,
  insight,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  insight: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="mt-2 text-3xl font-bold tracking-tight">{value}</CardTitle>
          </div>
          <div className={cn('rounded-2xl p-3 text-white shadow-lg', accent)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-foreground">{description}</p>
        <p className="text-sm text-muted-foreground">{insight}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const peakMonthlyBookings = Math.max(1, ...stats.monthlyBookings.map((item) => item.count));

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_left,rgba(16,185,129,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
              Шууд хяналтын тойм
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Хяналтын самбар</h1>
              <p className="max-w-2xl text-sm text-slate-300 lg:text-base">
                Контент, захиалга, явах тов, орлогын урсгалыг нэг дэлгэцээс хянах статистик төв.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {stats.posts.published}/{stats.posts.total} багц нийтлэгдсэн
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {stats.sessions.upcoming} удахгүй гарах тов
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {stats.bookings.totalPassengers} нийт зорчигч
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {formatCompactNumber(stats.visits.totalViews)} хандалт / 30 хоног
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Шинэ багц
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
              <Link href="/dashboard/departure-sessions/new">
                <CalendarDays className="mr-2 h-4 w-4" />
                Шинэ тов
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Контент бэлэн байдал"
          value={`${stats.posts.published}/${stats.posts.total}`}
          description={`${stats.posts.conversionRate}% нь нийтлэгдсэн байна`}
          insight={`${stats.posts.highlighted} багц онцлох хэсэгт байрлаж байна.`}
          icon={FileText}
          accent="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Захиалгын урсгал"
          value={formatCompactNumber(stats.bookings.total)}
          description={`${stats.bookings.pending} нь одоо хүлээгдэж байна`}
          insight={`${stats.bookings.confirmed + stats.bookings.completed} захиалга баталгаажсан эсвэл дууссан.`}
          icon={Users}
          accent="bg-gradient-to-br from-violet-500 to-fuchsia-600"
        />
        <StatCard
          title="Борлуулалтын дүн"
          value={formatCurrency(stats.bookings.totalRevenue)}
          description={`${stats.bookings.paid} захиалга бүрэн төлөгдсөн`}
          insight={`${stats.bookings.unpaid} захиалга төлбөрийн дагалт хүлээж байна.`}
          icon={CircleDollarSign}
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Суудлын ашиглалт"
          value={`${stats.sessions.occupancyRate}%`}
          description={`${stats.sessions.totalBookedSeats}/${stats.sessions.totalCapacity} суудал захиалагдсан`}
          insight={`${stats.sessions.open} нээлттэй, ${stats.sessions.full} дүүрсэн тов идэвхтэй байна.`}
          icon={TrendingUp}
          accent="bg-gradient-to-br from-orange-500 to-rose-600"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">Сүүлийн 6 сарын захиалгын импульс</CardTitle>
            <CardDescription>Захиалга болон борлуулалтын хандлагыг сар сараар харуулна.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Хүлээгдэж буй</p>
                <p className="mt-2 text-2xl font-semibold">{stats.bookings.pending}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Баталгаажсан</p>
                <p className="mt-2 text-2xl font-semibold">{stats.bookings.confirmed}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Дууссан</p>
                <p className="mt-2 text-2xl font-semibold">{stats.bookings.completed}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-6">
              {stats.monthlyBookings.map((month) => (
                <div key={month.key} className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.label}</span>
                    <span className="text-muted-foreground">{month.count}</span>
                  </div>
                  <div className="flex h-36 items-end rounded-xl bg-background/70 p-2">
                    <div
                      className="w-full rounded-lg bg-linear-to-t from-primary to-sky-400 transition-all"
                      style={{ height: `${Math.max(10, (month.count / peakMonthlyBookings) * 100)}%` }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Орлогын тойм</p>
                    <p className="text-sm font-medium">{formatCurrency(month.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">Операцийн радар</CardTitle>
            <CardDescription>Өнөөдөр анхаарах ёстой тоонууд.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Нээлттэй тов</p>
                  <p className="text-2xl font-semibold">{stats.sessions.open}</p>
                </div>
                <Badge className="bg-emerald-500">{SESSION_STATUS_LABELS.OPEN}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Дүүрсэн тов</p>
                  <p className="text-2xl font-semibold">{stats.sessions.full}</p>
                </div>
                <Badge className="bg-orange-500">{SESSION_STATUS_LABELS.FULL}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Цуцлагдсан тов</p>
                  <p className="text-2xl font-semibold">{stats.sessions.cancelled}</p>
                </div>
                <Badge className="bg-red-500">{SESSION_STATUS_LABELS.CANCELLED}</Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-dashed p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <p className="font-medium">Шуурхай анхаарах зүйлс</p>
              </div>
              {stats.attentionItems.length > 0 ? (
                <div className="space-y-2">
                  {stats.attentionItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Одоогоор онцгой анхаарах зүйл алга.</p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-500" />
                <p className="font-medium">Сайтын хандалт</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">30 хоногийн хандалт</p>
                  <p className="mt-1 text-lg font-semibold">{formatCompactNumber(stats.visits.totalViews)}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Давтагдашгүй зочин</p>
                  <p className="mt-1 text-lg font-semibold">{formatCompactNumber(stats.visits.uniqueVisitors)}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Өнөөдрийн хандалт</p>
                  <p className="mt-1 text-lg font-semibold">{formatCompactNumber(stats.visits.todayViews)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Сүүлийн 7 хоног</span>
                  <span className="font-medium">{formatCompactNumber(stats.visits.weekViews)}</span>
                </div>

                {stats.visits.topPaths.length > 0 ? (
                  <div className="space-y-2">
                    {stats.visits.topPaths.map((item) => (
                      <div key={item.path} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm">
                        <span className="max-w-[75%] truncate text-muted-foreground">{formatPathLabel(item.path)}</span>
                        <span className="font-semibold">{formatCompactNumber(item.views)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Хандалтын өгөгдөл хараахан алга.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Сүүлд орж ирсэн захиалгууд</CardTitle>
              <CardDescription>Шинэ захиалгын урсгалыг хурдан шалгах хэсэг.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/bookings">
                Бүгдийг үзэх
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                Захиалгын өгөгдөл хараахан алга.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border p-4 transition-colors hover:bg-muted/30">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{booking.booking_code}</p>
                          <Badge variant="outline">{BOOKING_STATUS_LABELS[booking.booking_status] ?? booking.booking_status}</Badge>
                          <Badge
                            className={cn(
                              booking.payment_status === 'PAID' && 'bg-emerald-500',
                              booking.payment_status === 'PARTIAL' && 'bg-orange-500',
                              booking.payment_status === 'UNPAID' && 'bg-red-500',
                              booking.payment_status === 'REFUNDED' && 'bg-slate-500'
                            )}
                          >
                            {PAYMENT_STATUS_LABELS[booking.payment_status] ?? booking.payment_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.contact_name} • {booking.post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.departure_session.departure_date)} • {booking.departure_session.label}
                        </p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="font-semibold">{formatCurrency(toNumber(booking.total_price_snapshot), booking.currency)}</p>
                        <p className="text-sm text-muted-foreground">{booking.passenger_count} зорчигч • {formatDate(booking.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Удахгүй гарах товууд</CardTitle>
              <CardDescription>Суудлын дүүргэлт, үнэ, хөдөлгөөнийг нэг дор.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/departure-sessions">
                Товууд руу
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.upcomingSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                Идэвхтэй удахгүй гарах тов алга.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingSessions.map((session) => {
                  const seatsLeft = Math.max(session.capacity - session.seats_booked, 0);
                  const fillRate = session.capacity > 0 ? Math.round((session.seats_booked / session.capacity) * 100) : 0;

                  return (
                    <div key={session.id} className="rounded-2xl border p-4 transition-colors hover:bg-muted/30">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{session.label}</p>
                              <Badge className={cn(session.status === 'OPEN' ? 'bg-emerald-500' : 'bg-orange-500')}>
                                {SESSION_STATUS_LABELS[session.status] ?? session.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{session.post.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(toNumber(session.final_price), session.currency)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(session.departure_date)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Суудлын дүүргэлт</span>
                            <span className="font-medium">{session.seats_booked}/{session.capacity} • {fillRate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                fillRate >= 100 ? 'bg-orange-500' : fillRate >= 70 ? 'bg-emerald-500' : 'bg-sky-500'
                              )}
                              style={{ width: `${Math.min(fillRate, 100)}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">Үлдсэн суудал: {seatsLeft}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Тэргүүлж буй аяллын багцууд</CardTitle>
              <CardDescription>Захиалга болон явах товын идэвхээр эрэмбэлсэн багцууд.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/posts">
                Багцууд руу
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.topPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                Багцын статистик хараахан бүрдээгүй байна.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topPosts.map((post, index) => (
                  <div key={post.id} className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{post.title}</p>
                          {post.published ? <Badge>Нийтлэгдсэн</Badge> : <Badge variant="secondary">Ноорог</Badge>}
                          {post.highlighted && <Badge variant="outline">Онцлох</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">/{post.slug}</p>
                        <p className="text-sm text-muted-foreground">Сүүлд шинэчилсэн: {formatDate(post.updated_at)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:min-w-72">
                      <div className="rounded-xl bg-muted/40 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Захиалга</p>
                        <p className="mt-1 text-lg font-semibold">{post._count.bookings}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Явах тов</p>
                        <p className="mt-1 text-lg font-semibold">{post._count.departure_sessions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">Түргэн удирдлага</CardTitle>
            <CardDescription>Өдөр тутмын ажлыг шууд эхлүүлэх холбоосууд.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/posts" className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Контент удирдах</p>
                  <p className="text-sm text-muted-foreground">Ноорог багцуудыг нийтлэл болгох</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link href="/dashboard/departure-sessions" className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Товын хуваарь шалгах</p>
                  <p className="text-sm text-muted-foreground">Нээлттэй болон дүүрсэн товуудыг хянах</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link href="/dashboard/bookings" className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/10 p-2 text-violet-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Захиалгын хяналт</p>
                  <p className="text-sm text-muted-foreground">Хүлээгдэж буй болон төлөөгүй захиалгыг дагах</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Өнөөдрийн фокус</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.bookings.pending > 0
                      ? `${stats.bookings.pending} хүлээгдэж буй захиалгыг эхэлж шалгаарай.`
                      : stats.posts.draft > 0
                        ? `${stats.posts.draft} ноорог багцыг нийтлэхэд бэлэн эсэхийг шалгаарай.`
                        : 'Самбар тогтвортой байна. Дараагийн контент эсвэл товоо бэлдэж болно.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
