'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  OPEN: 'bg-green-500',
  FULL: 'bg-orange-500',
  CANCELLED: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Ноорог',
  OPEN: 'Нээлттэй',
  FULL: 'Дүүрсэн',
  CANCELLED: 'Цуцлагдсан',
};

export default function DepartureSessionsPage() {
  const [sessions, setSessions] = useState<DepartureSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departure-sessions?limit=100');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching departure sessions:', error);
    } finally {
      setLoading(false);
    }
  };

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

      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Явах товыг устгаж чадсангүй');
    }
  };

  const getSeatsLeft = (session: DepartureSession) => {
    return session.capacity - session.seats_booked;
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Явах товууд</h1>
            <p className="text-muted-foreground mt-1">
              Аяллын багцуудын захиалах боломжтой явах товуудыг удирдана
            </p>
          </div>
          <Link href="/dashboard/departure-sessions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ тов
            </Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 md:p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Явах тов алга</h3>
            <p className="text-muted-foreground mt-2">
              Шинэ явах тов үүсгээд эхлээрэй
            </p>
            <Link href="/dashboard/departure-sessions/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Тов үүсгэх
              </Button>
            </Link>
          </div>
        ) : (
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
                {sessions.map((session) => (
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
                      <div className="font-medium">
                        {session.currency} {Number(session.final_price).toLocaleString()}
                      </div>
                      {Number(session.base_price) !== Number(session.final_price) && (
                        <div className="text-sm text-muted-foreground line-through">
                          {session.currency} {Number(session.base_price).toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{session.capacity}</TableCell>
                    <TableCell>
                      <span
                        className={
                          getSeatsLeft(session) === 0
                            ? 'text-red-600 font-semibold'
                            : getSeatsLeft(session) < 5
                            ? 'text-orange-600 font-semibold'
                            : ''
                        }
                      >
                        {getSeatsLeft(session)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[session.status]}>
                        {statusLabels[session.status] ?? session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/departure-sessions/${session.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Явах тов устгах</AlertDialogTitle>
                              <AlertDialogDescription>
                                Энэ явах товыг устгахдаа итгэлтэй байна уу?
                                Энэ үйлдлийг буцаах боломжгүй.
                                {session.seats_booked > 0 && (
                                  <p className="mt-2 text-red-600 font-semibold">
                                    Анхаар: Энэ тов дээр {session.seats_booked} захиалсан суудал байна!
                                  </p>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Болих</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSession(session.id)}
                                className="bg-red-600"
                              >
                                Устгах
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
