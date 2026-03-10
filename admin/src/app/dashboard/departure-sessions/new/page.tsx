'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
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
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  package_options: any;
}

interface FormData {
  post_id: string;
  package_option_id: string;
  departure_date: string;
  return_date: string;
  label: string;
  base_price: string;
  currency: string;
  discount_type: string;
  discount_value: string;
  discount_reason: string;
  capacity: string;
  status: string;
  public_note: string;
  internal_note: string;
}

export default function NewDepartureSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string | undefined;
  const isEditing = !!sessionId;

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    post_id: '',
    package_option_id: '',
    departure_date: '',
    return_date: '',
    label: '',
    base_price: '',
    currency: 'IDR',
    discount_type: '',
    discount_value: '',
    discount_reason: '',
    capacity: '10',
    status: 'DRAFT',
    public_note: '',
    internal_note: '',
  });

  useEffect(() => {
    fetchPosts();
    if (isEditing) {
      fetchSession();
    }
  }, [isEditing, sessionId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=100&published=true');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/departure-sessions/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setFormData({
          post_id: session.post_id,
          package_option_id: session.package_option_id || '',
          departure_date: session.departure_date.split('T')[0],
          return_date: session.return_date ? session.return_date.split('T')[0] : '',
          label: session.label,
          base_price: String(session.base_price),
          currency: session.currency,
          discount_type: session.discount_type || '',
          discount_value: session.discount_value ? String(session.discount_value) : '',
          discount_reason: session.discount_reason || '',
          capacity: String(session.capacity),
          status: session.status,
          public_note: session.public_note || '',
          internal_note: session.internal_note || '',
        });
        
        // Find and set the post
        const post = await fetch(`/api/posts/${session.post_id}`);
        if (post.ok) {
          const postData = await post.json();
          setSelectedPost(postData);
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.post_id) {
      const post = posts.find((p) => p.id === formData.post_id);
      setSelectedPost(post || null);
    }
  }, [formData.post_id, posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Calculate final price
      let finalPrice = parseFloat(formData.base_price);
      if (formData.discount_type && formData.discount_value) {
        const discountValue = parseFloat(formData.discount_value);
        if (formData.discount_type === 'FIXED') {
          finalPrice = finalPrice - discountValue;
        } else if (formData.discount_type === 'PERCENT') {
          finalPrice = finalPrice - (finalPrice * discountValue / 100);
        }
      }

      const payload = {
        ...formData,
        package_option_id: formData.package_option_id || null,
        return_date: formData.return_date || null,
        base_price: parseFloat(formData.base_price),
        discount_type: formData.discount_type || null,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
        discount_reason: formData.discount_reason || null,
        final_price: finalPrice,
        capacity: parseInt(formData.capacity),
        public_note: formData.public_note || null,
        internal_note: formData.internal_note || null,
      };

      const url = isEditing
        ? `/api/departure-sessions/${sessionId}`
        : '/api/departure-sessions';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...payload, id: sessionId } : payload),
      });

      if (response.ok) {
        router.push('/dashboard/departure-sessions');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Явах товыг хадгалж чадсангүй');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Явах товыг хадгалж чадсангүй');
    } finally {
      setSubmitting(false);
    }
  };

  const packageOptions =
    selectedPost?.package_options && Array.isArray(selectedPost.package_options)
      ? selectedPost.package_options
      : [];

  if (loading) {
    return <div className="container mx-auto py-8">Ачааллаж байна...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/departure-sessions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Товууд руу буцах
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Явах тов засах' : 'Шинэ явах тов'}</CardTitle>
          <CardDescription>
            Аяллын багцад зориулсан захиалах боломжтой явах тов үүсгэнэ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Selection */}
            <div className="space-y-2">
              <Label htmlFor="post_id">Аяллын багц *</Label>
              <Select
                value={formData.post_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, post_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Аяллын багц сонгох" />
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

            {/* Package Option */}
            {packageOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="package_option_id">Багцын сонголт (заавал биш)</Label>
                <Select
                  value={formData.package_option_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, package_option_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Сонгоогүй - дарж сонгоно уу" />
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

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Нэр *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="жишээ нь, 2026 оны 3-р сарын 15"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date">Явах огноо *</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) =>
                    setFormData({ ...formData, departure_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return_date">Буцах огноо</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) =>
                    setFormData({ ...formData, return_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Суурь үнэ *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData({ ...formData, base_price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Валют *</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  placeholder="IDR"
                  required
                />
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-4">
              <Label>Хөнгөлөлт (заавал биш)</Label>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={formData.discount_type || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Хөнгөлөлтгүй" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Тогтмол дүн</SelectItem>
                    <SelectItem value="PERCENT">Хувиар</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Утга"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  disabled={!formData.discount_type}
                />
                <Input
                  placeholder="Шалтгаан"
                  value={formData.discount_reason}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_reason: e.target.value })
                  }
                  disabled={!formData.discount_type}
                />
              </div>
            </div>

            {/* Capacity and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Багтаамж *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Төлөв *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Ноорог</SelectItem>
                    <SelectItem value="OPEN">Нээлттэй</SelectItem>
                    <SelectItem value="FULL">Дүүрсэн</SelectItem>
                    <SelectItem value="CANCELLED">Цуцлагдсан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="public_note">Нийтийн тэмдэглэл</Label>
              <Textarea
                id="public_note"
                value={formData.public_note}
                onChange={(e) =>
                  setFormData({ ...formData, public_note: e.target.value })
                }
                placeholder="Хэрэглэгчдэд харагдах тэмдэглэл"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_note">Дотоод тэмдэглэл</Label>
              <Textarea
                id="internal_note"
                value={formData.internal_note}
                onChange={(e) =>
                  setFormData({ ...formData, internal_note: e.target.value })
                }
                placeholder="Админы дотоод тэмдэглэл"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/dashboard/departure-sessions">
                <Button type="button" variant="outline">
                  Болих
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Хадгалж байна...' : isEditing ? 'Явах товыг шинэчлэх' : 'Явах тов үүсгэх'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
