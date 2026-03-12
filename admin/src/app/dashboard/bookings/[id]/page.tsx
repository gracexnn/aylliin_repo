'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Traveler {
  id?: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  passport_number: string;
  nationality: string;
  phone: string;
  email: string;
  emergency_contact: string;
  special_request: string;
}

interface TravelerResponse {
  id?: string;
  full_name: string;
  gender?: string | null;
  date_of_birth?: string | null;
  passport_number?: string | null;
  nationality?: string | null;
  phone?: string | null;
  email?: string | null;
  emergency_contact?: string | null;
  special_request?: string | null;
}

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  const [formData, setFormData] = useState({
    passenger_count: '1',
    total_price_snapshot: '',
    currency: 'MNT',
    booking_status: 'PENDING',
    payment_status: 'UNPAID',
    admin_note: '',
  });

  const [travelers, setTravelers] = useState<Traveler[]>([]);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const booking = await response.json();
        setBookingCode(booking.booking_code);
        setFormData({
          passenger_count: String(booking.passenger_count),
          total_price_snapshot: String(booking.total_price_snapshot),
          currency: booking.currency,
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          admin_note: booking.admin_note || '',
        });
        
        setTravelers(
          (booking.travelers || []).map((t: TravelerResponse) => ({
            id: t.id,
            full_name: t.full_name,
            gender: t.gender || '',
            date_of_birth: t.date_of_birth ? t.date_of_birth.split('T')[0] : '',
            passport_number: t.passport_number || '',
            nationality: t.nationality || '',
            phone: t.phone || '',
            email: t.email || '',
            emergency_contact: t.emergency_contact || '',
            special_request: t.special_request || '',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTraveler = () => {
    setTravelers([
      ...travelers,
      {
        full_name: '',
        gender: '',
        date_of_birth: '',
        passport_number: '',
        nationality: '',
        phone: '',
        email: '',
        emergency_contact: '',
        special_request: '',
      },
    ]);
  };

  const removeTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        id: bookingId,
        passenger_count: parseInt(formData.passenger_count),
        total_price_snapshot: parseFloat(formData.total_price_snapshot),
        currency: formData.currency,
        booking_status: formData.booking_status,
        payment_status: formData.payment_status,
        admin_note: formData.admin_note || null,
        travelers: travelers.map((t) => ({
          full_name: t.full_name,
          gender: t.gender || null,
          date_of_birth: t.date_of_birth || null,
          passport_number: t.passport_number || null,
          nationality: t.nationality || null,
          phone: t.phone || null,
          email: t.email || null,
          emergency_contact: t.emergency_contact || null,
          special_request: t.special_request || null,
        })),
      };

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/dashboard/bookings');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Захиалгыг шинэчилж чадсангүй');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Захиалгыг шинэчилж чадсангүй');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 md:p-8">Ачааллаж байна...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Захиалгууд руу буцах
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Захиалга засах: {bookingCode}</CardTitle>
            <CardDescription>Захиалгын мэдээлэл болон төлөвийг шинэчилнэ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passenger_count">Зорчигчийн тоо *</Label>
                <Input
                  id="passenger_count"
                  type="number"
                  min="1"
                  value={formData.passenger_count}
                  onChange={(e) =>
                    setFormData({ ...formData, passenger_count: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_price_snapshot">Нийт үнэ *</Label>
                <Input
                  id="total_price_snapshot"
                  type="number"
                  step="0.01"
                  value={formData.total_price_snapshot}
                  onChange={(e) =>
                    setFormData({ ...formData, total_price_snapshot: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_status">Захиалгын төлөв *</Label>
                <Select
                  value={formData.booking_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, booking_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Хүлээгдэж буй</SelectItem>
                    <SelectItem value="CONFIRMED">Баталгаажсан</SelectItem>
                    <SelectItem value="CANCELLED">Цуцлагдсан</SelectItem>
                    <SelectItem value="COMPLETED">Дууссан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Төлбөрийн төлөв *</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payment_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPAID">Төлөөгүй</SelectItem>
                    <SelectItem value="PARTIAL">Хэсэгчлэн төлсөн</SelectItem>
                    <SelectItem value="PAID">Төлсөн</SelectItem>
                    <SelectItem value="REFUNDED">Буцаасан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Admin Note */}
            <div className="space-y-2">
              <Label htmlFor="admin_note">Админы тэмдэглэл</Label>
              <Textarea
                id="admin_note"
                value={formData.admin_note}
                onChange={(e) => setFormData({ ...formData, admin_note: e.target.value })}
                placeholder="Энэ захиалгын дотоод тэмдэглэл"
              />
            </div>
          </CardContent>
        </Card>

        {/* Travelers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Зорчигчийн мэдээлэл</CardTitle>
                <CardDescription>Зорчигчийн мэдээллийг шинэчилнэ</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTraveler}>
                <Plus className="mr-2 h-4 w-4" />
                Зорчигч нэмэх
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {travelers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Одоогоор зорчигч нэмээгүй байна. &quot;Зорчигч нэмэх&quot; дээр дарж мэдээлэл оруулна уу.
              </p>
            ) : (
              travelers.map((traveler, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Зорчигч {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTraveler(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Овог нэр *</Label>
                        <Input
                          value={traveler.full_name}
                          onChange={(e) =>
                            updateTraveler(index, 'full_name', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Хүйс (заавал биш)</Label>
                        <Select
                          value={traveler.gender || undefined}
                          onValueChange={(value) => updateTraveler(index, 'gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Хүйс сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Эрэгтэй</SelectItem>
                            <SelectItem value="Female">Эмэгтэй</SelectItem>
                            <SelectItem value="Other">Бусад</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Төрсөн огноо</Label>
                        <Input
                          type="date"
                          value={traveler.date_of_birth}
                          onChange={(e) =>
                            updateTraveler(index, 'date_of_birth', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Паспортын дугаар</Label>
                        <Input
                          value={traveler.passport_number}
                          onChange={(e) =>
                            updateTraveler(index, 'passport_number', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Иргэншил</Label>
                        <Input
                          value={traveler.nationality}
                          onChange={(e) =>
                            updateTraveler(index, 'nationality', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Утас</Label>
                        <Input
                          value={traveler.phone}
                          onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Имэйл</Label>
                        <Input
                          type="email"
                          value={traveler.email}
                          onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Яаралтай үед холбоо барих хүн</Label>
                      <Input
                        value={traveler.emergency_contact}
                        onChange={(e) =>
                          updateTraveler(index, 'emergency_contact', e.target.value)
                        }
                        placeholder="Нэр болон утасны дугаар"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Тусгай хүсэлт</Label>
                      <Textarea
                        value={traveler.special_request}
                        onChange={(e) =>
                          updateTraveler(index, 'special_request', e.target.value)
                        }
                        placeholder="Хоолны онцгой шаардлага, хүртээмжийн хэрэгцээ гэх мэт"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/bookings">
            <Button type="button" variant="outline">
              Болих
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Шинэчилж байна...' : 'Захиалгыг шинэчлэх'}
          </Button>
        </div>
      </form>
    </div>
  );
}
