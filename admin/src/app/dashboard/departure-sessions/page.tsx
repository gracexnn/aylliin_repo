
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilterX,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatDate } from '@/lib/utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface DepartureSession {
  id: string;
  departure_date: string;
  return_date: string | null;
  label: string;
  base_price: number;
  final_price: number;
  currency: string;
  capacity: number;
  seats_booked: number;
  status: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
  _count?: {
    bookings: number;
  };
}

type ViewMode = 'table' | 'calendar';

const ALL_FILTER_VALUE = 'all';
const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50];

const weekdayLabels = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  OPEN: 'bg-green-500',
  FULL: 'bg-orange-500',
  CANCELLED: 'bg-red-500',
};

const statusEventColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
  OPEN: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  FULL: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Ноорог',
  OPEN: 'Нээлттэй',
  FULL: 'Дүүрсэн',
  CANCELLED: 'Цуцлагдсан',
};

function getDateParts(value: string | Date) {
  if (typeof value === 'string') {
    const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  const date = new Date(value);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function getMonthKey(value: string | Date) {
  const { year, month } = getDateParts(value);

  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, 1));
}

function getSeatsLeft(session: DepartureSession) {
  return session.capacity - session.seats_booked;
}

function formatSessionPrice(session: DepartureSession) {
  return `${session.currency} ${Number(session.final_price).toLocaleString()}`;
}

function getUtcTimestamp(value: string | Date) {
  const { year, month, day } = getDateParts(value);
  return Date.UTC(year, month - 1, day);
}

function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn(statusColors[status] ?? 'bg-slate-500', 'text-white', className)}
    >
      {statusLabels[status] ?? status}
    </Badge>
  );
}

function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-8 text-center">
      <Search className="h-12 w-12 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Тохирох яввах тов олдсонгүй</h3>
        <p className="text-muted-foreground">
          Шүүлтүүрээ өөрчлөх эсвэл цэвэрлээд дахин оролдоно уу.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onReset}>
        <FilterX className="mr-2 h-4 w-4" />
        Шүүлтүүр цэвэрлэх
      </Button>
    </div>
  );
}

function SessionsTable({
  sessions,
  onDelete,
}: {
  sessions: DepartureSession[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Аяллын багц</TableHead>
            <TableHead>Нэр</TableHead>
            <TableHead>Явах огноо</TableHead>
            <TableHead>Үнэ</TableHead>
            <TableHead>Багтаамж</TableHead>
            <TableHead>Үлдсэн суудал</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead className="text-right">Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const seatsLeft = getSeatsLeft(session);

            return (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="font-medium">{session.post.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {session.post.slug}
                  </div>
                </TableCell>
                <TableCell>{session.label}</TableCell>
                <TableCell>
                  <div>{formatDate(session.departure_date)}</div>
                  {session.return_date && (
                    <div className="text-sm text-muted-foreground">
                      хүртэл {formatDate(session.return_date)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatSessionPrice(session)}</div>
                  {Number(session.base_price) !== Number(session.final_price) && (
                    <div className="text-sm text-muted-foreground line-through">
                      {session.currency} {Number(session.base_price).toLocaleString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>{session.capacity}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      seatsLeft === 0 && 'font-semibold text-red-600',
                      seatsLeft > 0 && seatsLeft < 5 && 'font-semibold text-orange-600'
                    )}
                  >
                    {seatsLeft}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={session.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/departure-sessions/${session.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Явах тов устгах</AlertDialogTitle>
                          <AlertDialogDescription className="flex flex-col gap-2">
                            <span>
                              Энэ явах товыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг
                              буцаах боломжгүй.
                            </span>
                            {session.seats_booked > 0 && (
                              <span className="font-semibold text-red-600">
                                Анхаар: Энэ тов дээр {session.seats_booked} захиалсан
                                суудал байна.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Болих</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              void onDelete(session.id);
                            }}
                          >
                            Устгах
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function DepartureSessionsFullCalendar({
  sessions,
  activeDate,
}: {
  sessions: DepartureSession[];
  activeDate: Date;
}) {
  const calendarRef = useRef<any>(null);
  const [selectedSession, setSelectedSession] = useState<DepartureSession | null>(null);
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(activeDate);
    }
  }, [activeDate]);

  const events = useMemo(() => {
    return sessions.map((session) => {
      // FullCalendar end date is exclusive for all-day events
      const endDate = session.return_date
        ? new Date(new Date(session.return_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(new Date(session.departure_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        id: session.id,
        title: session.label,
        start: session.departure_date.split('T')[0],
        end: endDate,
        allDay: true,
        extendedProps: {
          session,
        },
      };
    });
  }, [sessions]);

  return (
    <Card className="p-4 overflow-hidden bg-background">
      <div className="fc-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={activeDate}
          events={events}
          headerToolbar={false} // We will control this via our custom dropdown if needed, or hide it
          firstDay={1} // Monday
          height="auto"
          dayMaxEvents={4}
          dayHeaderContent={(arg) => weekdayLabels[arg.date.getDay()]}
          eventClick={(info) => {
            setSelectedSession(info.event.extendedProps.session);
          }}
          eventContent={(eventInfo) => {
            const session = eventInfo.event.extendedProps.session;
            return (
              <button
                className={cn(
                  "flex items-center justify-between w-full overflow-hidden text-xs rounded px-1.5 py-1 transition-all hover:brightness-95 border cursor-pointer",
                  statusEventColors[session.status] ?? statusEventColors.DRAFT
                )}
                title={`${session.post.title}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      statusColors[session.status] ?? 'bg-slate-500'
                    )}
                  />
                  <span className="font-semibold truncate text-[11px]">
                    {session.label}
                  </span>
                </div>
                <span className="truncate text-[10px] opacity-80 pl-1 font-medium shrink-0">
                  {getSeatsLeft(session)} суудал
                </span>
              </button>
            );
          }}
          eventClassNames={() => 'fc-custom-event-wrapper mx-0.5 mt-0.5'}
        />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .fc-wrapper {
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-today-bg-color: hsl(var(--primary) / 0.05);
          --fc-border-color: hsl(var(--border));
        }
        .fc-wrapper .fc-theme-standard td, .fc-wrapper .fc-theme-standard th, .fc-wrapper .fc-theme-standard .fc-scrollgrid {
          border-color: hsl(var(--border));
        }
        .fc-wrapper .fc-col-header-cell {
          padding: 0.75rem 0;
          background-color: transparent !important;
          color: hsl(var(--muted-background));
          text-transform: uppercase;
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }
        .fc-wrapper .fc-daygrid-day-number {
          padding: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .fc-wrapper .fc-day-other .fc-daygrid-day-top {
          opacity: 0.5;
        }
        .fc-wrapper .fc-event.fc-custom-event-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}} />
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-md animate-in fade-in zoom-in-95 duration-300">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSession.label}</DialogTitle>
                <DialogDescription>{selectedSession.post.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Төлөв</p>
                    <Badge className={cn(
                      statusColors[selectedSession.status] ? `${statusColors[selectedSession.status]} text-white` : ''
                    )}>
                      {statusLabels[selectedSession.status] ?? selectedSession.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Үлдсэн суудал</p>
                    <p className="text-sm font-medium">{getSeatsLeft(selectedSession)} / {selectedSession.capacity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Явах огноо</p>
                    <p className="text-sm font-medium">{formatDate(new Date(selectedSession.departure_date))}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Буцах огноо</p>
                    <p className="text-sm font-medium">{selectedSession.return_date ? formatDate(new Date(selectedSession.return_date)) : '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Үнэ</p>
                    <p className="text-sm font-medium">{selectedSession.final_price} {selectedSession.currency}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Захиалсан</p>
                    <p className="text-sm font-medium">{selectedSession.seats_booked}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/departure-sessions/${selectedSession.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Дэлгэрэнгүй
                    </Button>
                  </Link>
                  <Link href={`/dashboard/departure-sessions/${selectedSession.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Pencil className="w-4 h-4" />
                      Засах
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Устгах
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function DepartureSessionsPage() {
  const [sessions, setSessions] = useState<DepartureSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('table');
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(TABLE_PAGE_SIZE_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
  const [postFilter, setPostFilter] = useState(ALL_FILTER_VALUE);
  const [monthFilter, setMonthFilter] = useState(ALL_FILTER_VALUE);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departure-sessions?limit=all');

      if (!response.ok) {
        throw new Error('Failed to fetch departure sessions');
      }

      const data = await response.json();
      setSessions(data.sessions ?? []);
    } catch (error) {
      console.error('Error fetching departure sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const deleteSession = async (id: string) => {
    try {
      const response = await fetch(`/api/departure-sessions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Явах товыг устгаж чадсангүй');
        return;
      }

      await fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Явах товыг устгаж чадсангүй');
    }
  };

  const postOptions = useMemo(
    () =>
      Array.from(
        new Map(sessions.map((session) => [session.post.id, session.post])).values()
      ).toSorted((left, right) => left.title.localeCompare(right.title)),
    [sessions]
  );

  const monthOptions = useMemo(
    () =>
      Array.from(new Set(sessions.map((session) => getMonthKey(session.departure_date))))
        .toSorted()
        .map((monthKey) => ({
          value: monthKey,
          label: formatMonthLabel(monthKey),
        })),
    [sessions]
  );

  const baseFilteredSessions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [session.label, session.post.title, session.post.slug].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        );
      const matchesStatus =
        statusFilter === ALL_FILTER_VALUE || session.status === statusFilter;
      const matchesPost =
        postFilter === ALL_FILTER_VALUE || session.post.id === postFilter;

      return matchesQuery && matchesStatus && matchesPost;
    });
  }, [postFilter, searchQuery, sessions, statusFilter]);

  const filteredSessions = useMemo(
    () =>
      monthFilter === ALL_FILTER_VALUE
        ? baseFilteredSessions
        : baseFilteredSessions.filter(
            (session) => getMonthKey(session.departure_date) === monthFilter
          ),
    [baseFilteredSessions, monthFilter]
  );

  const { openSessionCount, calendarMonthOptions } = useMemo(() => {
    let openCount = 0;
    const monthKeys = new Set<string>();

    baseFilteredSessions.forEach((session) => {
      if (session.status === 'OPEN') {
        openCount += 1;
      }
      monthKeys.add(getMonthKey(session.departure_date));
    });

    const monthOptions = Array.from(monthKeys)
      .toSorted()
      .map((monthKey) => ({
        value: monthKey,
        label: formatMonthLabel(monthKey),
      }));

    return {
      openSessionCount: openCount,
      calendarMonthOptions: monthOptions,
    };
  }, [baseFilteredSessions]);

  const currentMonthKey = getMonthKey(new Date());

  const activeCalendarMonthKey = useMemo(() => {
    if (calendarMonthOptions.length === 0) {
      return null;
    }

    if (monthFilter !== ALL_FILTER_VALUE) {
      return calendarMonthOptions.some((month) => month.value === monthFilter)
        ? monthFilter
        : calendarMonthOptions[0].value;
    }

    const currentMonthOption = calendarMonthOptions.find(
      (month) => month.value === currentMonthKey
    );

    return currentMonthOption?.value ?? calendarMonthOptions[0].value;
  }, [calendarMonthOptions, currentMonthKey, monthFilter]);

  const activeCalendarMonthIndex = useMemo(
    () =>
      activeCalendarMonthKey
        ? calendarMonthOptions.findIndex((month) => month.value === activeCalendarMonthKey)
        : -1,
    [activeCalendarMonthKey, calendarMonthOptions]
  );
  
  const activeCalendarDate = useMemo(() => {
    if (!activeCalendarMonthKey) return new Date();
    const [year, month] = activeCalendarMonthKey.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [activeCalendarMonthKey]);

  const activeCalendarMonthLabel = useMemo(() => {
    if (!activeCalendarMonthKey) return '';
    return formatMonthLabel(activeCalendarMonthKey);
  }, [activeCalendarMonthKey]);

  const tableTotalPages = Math.max(
    1,
    Math.ceil(filteredSessions.length / tablePageSize)
  );

  const paginatedTableSessions = useMemo(() => {
    const startIndex = (tablePage - 1) * tablePageSize;
    return filteredSessions.slice(startIndex, startIndex + tablePageSize);
  }, [filteredSessions, tablePage, tablePageSize]);

  useEffect(() => {
    setTablePage(1);
  }, [searchQuery, statusFilter, postFilter, monthFilter]);

  useEffect(() => {
    if (tablePage > tableTotalPages) {
      setTablePage(tableTotalPages);
    }
  }, [tablePage, tableTotalPages]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== ALL_FILTER_VALUE ||
    postFilter !== ALL_FILTER_VALUE ||
    monthFilter !== ALL_FILTER_VALUE;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(ALL_FILTER_VALUE);
    setPostFilter(ALL_FILTER_VALUE);
    setMonthFilter(ALL_FILTER_VALUE);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <p>Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Явах товууд</h1>
            <p className="mt-1 text-muted-foreground">
              Аяллын багцуудын захиалах боломжтой явах товуудыг удирдана
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/departure-sessions/new">
              <Plus className="mr-2 h-4 w-4" />
              Шинэ тов
            </Link>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center md:p-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Явах тов алга</h3>
            <p className="mt-2 text-muted-foreground">
              Шинэ явах тов үүсгээд эхлээрэй
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/departure-sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Тов үүсгэх
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs
            className="flex flex-col gap-6"
            onValueChange={(value) => setView(value as ViewMode)}
            value={view}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">Шүүлтүүр ба харагдац</CardTitle>
                    <CardDescription>
                      Хүснэгт болон хуанлийн харагдац ижил шүүлтүүрээр шинэчлэгдэнэ.
                    </CardDescription>
                  </div>
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                    <TabsTrigger className="gap-2" value="table">
                      <LayoutList className="h-4 w-4" />
                      Хүснэгт
                    </TabsTrigger>
                    <TabsTrigger className="gap-2" value="calendar">
                      <CalendarDays className="h-4 w-4" />
                      Хуанли
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="departure-session-search">Хайлт</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        id="departure-session-search"
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Товын нэр, багц, slug..."
                        value={searchQuery}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Төлөв</Label>
                    <Select onValueChange={setStatusFilter} value={statusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Бүх төлөв" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={ALL_FILTER_VALUE}>Бүх төлөв</SelectItem>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Аяллын багц</Label>
                    <Select onValueChange={setPostFilter} value={postFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Бүх багц" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={ALL_FILTER_VALUE}>Бүх багц</SelectItem>
                          {postOptions.map((post) => (
                            <SelectItem key={post.id} value={post.id}>
                              {post.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Сар</Label>
                    <Select onValueChange={setMonthFilter} value={monthFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Бүх сар" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={ALL_FILTER_VALUE}>Бүх сар</SelectItem>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{filteredSessions.length} тов</Badge>
                    <Badge variant="outline">{openSessionCount} нээлттэй</Badge>
                    <Badge variant="outline">{calendarMonthOptions.length} сар</Badge>
                  </div>
                  <Button
                    disabled={!hasActiveFilters}
                    onClick={clearFilters}
                    type="button"
                    variant="ghost"
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    Шүүлтүүр цэвэрлэх
                  </Button>
                </div>
              </CardContent>
            </Card>

            <TabsContent className="mt-0" value="table">
              {filteredSessions.length === 0 ? (
                <FilteredEmptyState onReset={clearFilters} />
              ) : (
                <div className="flex flex-col gap-4">
                  <SessionsTable
                    onDelete={deleteSession}
                    sessions={paginatedTableSessions}
                  />
                  <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {(tablePage - 1) * tablePageSize + 1}-
                        {Math.min(tablePage * tablePageSize, filteredSessions.length)} /{' '}
                        {filteredSessions.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        onValueChange={(value) => {
                          setTablePageSize(Number(value));
                          setTablePage(1);
                        }}
                        value={String(tablePageSize)}
                      >
                        <SelectTrigger className="w-32.5">
                          <SelectValue placeholder="Хуудас" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
                              <SelectItem key={size} value={String(size)}>
                                {size} / хуудас
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={tablePage <= 1}
                        onClick={() => setTablePage((currentPage) => currentPage - 1)}
                        type="button"
                        variant="outline"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Өмнөх
                      </Button>
                      <Badge variant="outline">
                        {tablePage} / {tableTotalPages}
                      </Badge>
                      <Button
                        disabled={tablePage >= tableTotalPages}
                        onClick={() => setTablePage((currentPage) => currentPage + 1)}
                        type="button"
                        variant="outline"
                      >
                        Дараах
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent className="mt-0" value="calendar">
              {filteredSessions.length === 0 ? (
                <FilteredEmptyState onReset={clearFilters} />
              ) : (
                <div className="flex flex-col gap-4">
                  {activeCalendarMonthLabel && (
                    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={activeCalendarMonthIndex <= 0}
                          onClick={() => {
                            const previousMonth =
                              calendarMonthOptions[activeCalendarMonthIndex - 1];
                            if (previousMonth) {
                              setMonthFilter(previousMonth.value);
                            }
                          }}
                          type="button"
                          variant="outline"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Өмнөх сар
                        </Button>
                        <Badge variant="outline">{activeCalendarMonthLabel}</Badge>
                        <Button
                          disabled={
                            activeCalendarMonthIndex < 0 ||
                            activeCalendarMonthIndex >= calendarMonthOptions.length - 1
                          }
                          onClick={() => {
                            const nextMonth = calendarMonthOptions[activeCalendarMonthIndex + 1];
                            if (nextMonth) {
                              setMonthFilter(nextMonth.value);
                            }
                          }}
                          type="button"
                          variant="outline"
                        >
                          Дараах сар
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <DepartureSessionsFullCalendar
                    sessions={filteredSessions}
                    activeDate={activeCalendarDate}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}