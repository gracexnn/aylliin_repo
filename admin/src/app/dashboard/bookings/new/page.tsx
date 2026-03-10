'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface Post {
  id: string;
  title: string;
  package_options: any;
}

interface DepartureSession {
  id: string;
  label: string;
  departure_date: string;
  return_date: string | null;
  final_price: number;
  capacity: number;
  seats_booked: number;
  currency: string;
}

interface Traveler {
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

export default function NewBookingPage() {
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<DepartureSession[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedSession, setSelectedSession] = useState<DepartureSession | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    post_id: '',
    departure_session_id: '',
    package_option_id: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    passenger_count: '1',
    total_price_snapshot: '',
    currency: 'IDR',
    booking_status: 'PENDING',
    payment_status: 'UNPAID',
    admin_note: '',
    source: 'admin',
  });

  const [travelers, setTravelers] = useState<Traveler[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (formData.post_id) {
      fetchSessions(formData.post_id);
      const post = posts.find((p) => p.id === formData.post_id);
      setSelectedPost(post || null);
    }
  }, [formData.post_id, posts]);

  useEffect(() => {
    if (formData.departure_session_id) {
      const session = sessions.find((s) => s.id === formData.departure_session_id);
      setSelectedSession(session || null);
      if (session) {
        setFormData((prev) => ({
          ...prev,
          currency: session.currency,
          total_price_snapshot: String(session.final_price * parseInt(prev.passenger_count || '1')),
        }));
      }
    }
  }, [formData.departure_session_id, sessions]);

  useEffect(() => {
    if (selectedSession && formData.passenger_count) {
      const count = parseInt(formData.passenger_count) || 1;
      setFormData((prev) => ({
        ...prev,
        total_price_snapshot: String(selectedSession.final_price * count),
      }));
    }
  }, [formData.passenger_count, selectedSession]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=100&published=true');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSessions = async (postId: string) => {
    try {
      const response = await fetch(`/api/departure-sessions?post_id=${postId}&status=OPEN`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
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
        ...formData,
        passenger_count: parseInt(formData.passenger_count),
        total_price_snapshot: parseFloat(formData.total_price_snapshot),
        package_option_id: formData.package_option_id || null,
        admin_note: formData.admin_note || null,
        travelers: travelers.map((t) => ({
          ...t,
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

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/dashboard/bookings');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const packageOptions =
    selectedPost?.package_options && Array.isArray(selectedPost.package_options)
      ? selectedPost.package_options
      : [];

  const seatsAvailable = selectedSession
    ? selectedSession.capacity - selectedSession.seats_booked
    : 0;

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>New Booking</CardTitle>
            <CardDescription>Create a new travel reservation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post and Session Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post_id">Travel Package *</Label>
                <Select
                  value={formData.post_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, post_id: value, departure_session_id: '' })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure_session_id">Departure Session *</Label>
                <Select
                  value={formData.departure_session_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departure_session_id: value })
                  }
                  required
                  disabled={!formData.post_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.label} - {session.currency}{' '}
                        {Number(session.final_price).toLocaleString()} (
                        {session.capacity - session.seats_booked} seats left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSession && (
                  <p className="text-sm text-muted-foreground">
                    {seatsAvailable} seats available
                  </p>
                )}
              </div>
            </div>

            {/* Package Option */}
            {packageOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="package_option_id">Package Option (Optional)</Label>
                <Select
                  value={formData.package_option_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, package_option_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None - Select to override" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map((option: any, index: number) => (
                      <SelectItem key={option.id || index} value={option.id || String(index)}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone *</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passenger_count">Passenger Count *</Label>
                <Input
                  id="passenger_count"
                  type="number"
                  min="1"
                  max={seatsAvailable}
                  value={formData.passenger_count}
                  onChange={(e) =>
                    setFormData({ ...formData, passenger_count: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_price_snapshot">Total Price *</Label>
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
              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_status">Booking Status *</Label>
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
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status *</Label>
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
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Admin Note */}
            <div className="space-y-2">
              <Label htmlFor="admin_note">Admin Note</Label>
              <Textarea
                id="admin_note"
                value={formData.admin_note}
                onChange={(e) => setFormData({ ...formData, admin_note: e.target.value })}
                placeholder="Internal notes about this booking"
              />
            </div>
          </CardContent>
        </Card>

        {/* Travelers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Traveler Details</CardTitle>
                <CardDescription>Add information for each passenger (optional)</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTraveler}>
                <Plus className="mr-2 h-4 w-4" />
                Add Traveler
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {travelers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No travelers added yet. Click "Add Traveler" to add passenger details.
              </p>
            ) : (
              travelers.map((traveler, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Traveler {index + 1}</CardTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={traveler.full_name}
                          onChange={(e) =>
                            updateTraveler(index, 'full_name', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender (Optional)</Label>
                        <Select
                          value={traveler.gender || undefined}
                          onValueChange={(value) => updateTraveler(index, 'gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={traveler.date_of_birth}
                          onChange={(e) =>
                            updateTraveler(index, 'date_of_birth', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passport Number</Label>
                        <Input
                          value={traveler.passport_number}
                          onChange={(e) =>
                            updateTraveler(index, 'passport_number', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nationality</Label>
                        <Input
                          value={traveler.nationality}
                          onChange={(e) =>
                            updateTraveler(index, 'nationality', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={traveler.phone}
                          onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={traveler.email}
                          onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      <Input
                        value={traveler.emergency_contact}
                        onChange={(e) =>
                          updateTraveler(index, 'emergency_contact', e.target.value)
                        }
                        placeholder="Name and phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Special Requests</Label>
                      <Textarea
                        value={traveler.special_request}
                        onChange={(e) =>
                          updateTraveler(index, 'special_request', e.target.value)
                        }
                        placeholder="Dietary restrictions, accessibility needs, etc."
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
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
