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
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Booking {
  id: string;
  booking_code: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  passenger_count: number;
  total_price_snapshot: number;
  currency: string;
  booking_status: string;
  payment_status: string;
  source: string;
  created_at: string;
  post: {
    title: string;
  };
  departure_session: {
    departure_date: string;
    label: string;
  };
  travelers: any[];
}

const bookingStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-green-500',
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-red-500',
  PARTIAL: 'bg-orange-500',
  PAID: 'bg-green-500',
  REFUNDED: 'bg-gray-500',
};

const bookingStatusLabels: Record<string, string> = {
  PENDING: 'Хүлээгдэж буй',
  CONFIRMED: 'Баталгаажсан',
  CANCELLED: 'Цуцлагдсан',
  COMPLETED: 'Дууссан',
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: 'Төлөөгүй',
  PARTIAL: 'Хэсэгчлэн төлсөн',
  PAID: 'Төлсөн',
  REFUNDED: 'Буцаасан',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings?limit=100');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Захиалгыг устгаж чадсангүй');
        return;
      }

      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Захиалгыг устгаж чадсангүй');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Захиалгууд</h1>
            <p className="text-muted-foreground mt-1">
              Аяллын захиалга болон хэрэглэгчдийн бүртгэлийг удирдана
            </p>
          </div>
          <Link href="/dashboard/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ захиалга
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Одоогоор захиалга алга</h3>
            <p className="text-muted-foreground mt-2">
              Эхний захиалгаа үүсгээд эхлээрэй
            </p>
            <Link href="/dashboard/bookings/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Захиалга үүсгэх
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Захиалгын код</TableHead>
                  <TableHead>Холбоо барих</TableHead>
                  <TableHead>Аяллын багц</TableHead>
                  <TableHead>Явах тов</TableHead>
                  <TableHead>Зорчигч</TableHead>
                  <TableHead>Нийт үнэ</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono font-semibold">
                      {booking.booking_code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.contact_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.contact_phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{booking.post.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>{formatDate(booking.departure_session.departure_date)}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.departure_session.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.passenger_count}
                      {booking.travelers?.length > 0 && (
                        <span className="text-muted-foreground text-sm">
                          {' '}/ {booking.travelers.length} дэлгэрэнгүй
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {booking.currency}{' '}
                        {Number(booking.total_price_snapshot).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={bookingStatusColors[booking.booking_status]}>
                        {bookingStatusLabels[booking.booking_status] ?? booking.booking_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[booking.payment_status]}>
                        {paymentStatusLabels[booking.payment_status] ?? booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
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
                              <AlertDialogTitle>Захиалга устгах</AlertDialogTitle>
                              <AlertDialogDescription>
                                Та{' '}
                                <strong>{booking.booking_code}</strong>?
                                {' '}гэсэн захиалгыг устгахдаа итгэлтэй байна уу?
                                Ингэснээр зорчигчдын бүх мэдээлэл устаж, {booking.passenger_count} суудал сулрана.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Болих</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBooking(booking.id)}
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
