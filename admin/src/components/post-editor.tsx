'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import {
  CreatePostSchema,
  type CreatePost,
  type ItineraryDay,
  type PackageDeparture,
  type PackageOption,
} from '@/schemas';
import ImageUpload from './image-upload';
import RichTextEditor from './rich-text-editor';
import LibraryItemPicker, { type SelectedLibraryItem } from './library-item-picker';
import { Save, Loader2, Plus, Trash2, CalendarRange, Route, Sparkles, ListChecks } from 'lucide-react';

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    cover_image?: string | null;
    excerpt?: string | null;
    content?: string | null;
    journey_overview?: string | null;
    package_options?: PackageOption[] | null;
    included_items?: string[];
    attraction_items?: string[];
    itinerary_days?: ItineraryDay[] | null;
    travel_tips?: string | null;
    published?: boolean;
    highlighted?: boolean;
  };
  postId?: string;
  onSave?: (postId: string) => void;
}

function createEmptyDeparture(): PackageDeparture {
  return {
    label: '',
    price: '',
    secondary_price: '',
  };
}

function createEmptyPackage(): PackageOption {
  return {
    title: '',
    route_path: '',
    duration_label: '',
    departures: [createEmptyDeparture()],
    notes: [],
  };
}

function createEmptyItineraryDay(dayNumber: number): ItineraryDay {
  return {
    day_number: dayNumber,
    title: '',
    route_label: '',
    description: '',
    meals: [],
    optional_extras: [],
  };
}

function normalizeStringArray(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function StringListEditor({
  label,
  description,
  items,
  placeholder,
  addLabel,
  onChange,
}: {
  label: string;
  description?: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (next: string[]) => void;
}) {
  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addItem = () => onChange([...items, '']);
  const removeItem = (index: number) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => updateItem(index, e.target.value)}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeItem(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

type PostFormValues = z.input<typeof CreatePostSchema>;

export default function PostEditor({ initialData, postId, onSave }: PostEditorProps) {
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [journeyOverview, setJourneyOverview] = useState(initialData?.journey_overview ?? '');
  const [travelTips, setTravelTips] = useState(initialData?.travel_tips ?? '');
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>(initialData?.package_options ?? []);
  const [includedItems, setIncludedItems] = useState<string[]>(initialData?.included_items ?? []);
  const [attractionItems, setAttractionItems] = useState<string[]>(initialData?.attraction_items ?? []);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(
    [...(initialData?.itinerary_days ?? [])].sort((a, b) => a.day_number - b.day_number)
  );

  // Library-based inclusions and highlights
  const [libraryInclusions, setLibraryInclusions] = useState<SelectedLibraryItem[]>([]);
  const [libraryHighlights, setLibraryHighlights] = useState<SelectedLibraryItem[]>([]);

  useEffect(() => {
    if (!postId) return;
    // Load existing library assignments for this post
    Promise.all([
      fetch(`/api/posts/${postId}/inclusions`).then((r) => r.json()),
      fetch(`/api/posts/${postId}/highlights`).then((r) => r.json()),
    ]).then(([inclusions, highlights]) => {
      if (Array.isArray(inclusions)) {
        setLibraryInclusions(
          inclusions.map((i: { inclusion_id: string; label_snapshot: string; order_index: number }) => ({
            inclusion_id: i.inclusion_id,
            label_snapshot: i.label_snapshot,
            order_index: i.order_index,
          }))
        );
      }
      if (Array.isArray(highlights)) {
        setLibraryHighlights(
          highlights.map((h: { highlight_id: string; label_snapshot: string; order_index: number }) => ({
            highlight_id: h.highlight_id,
            label_snapshot: h.label_snapshot,
            order_index: h.order_index,
          }))
        );
      }
    }).catch(() => { /* library data is optional - non-critical */ });
  }, [postId]);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      cover_image: initialData?.cover_image ?? undefined,
      excerpt: initialData?.excerpt ?? '',
      content: initialData?.content ?? '',
      journey_overview: initialData?.journey_overview ?? '',
      package_options: initialData?.package_options ?? [],
      included_items: initialData?.included_items ?? [],
      attraction_items: initialData?.attraction_items ?? [],
      itinerary_days: initialData?.itinerary_days ?? [],
      travel_tips: initialData?.travel_tips ?? '',
      published: initialData?.published ?? false,
      highlighted: initialData?.highlighted ?? false,
    },
  });

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    form.setValue('title', e.target.value);
    if (!postId) {
      form.setValue('slug', slugify(e.target.value));
    }
  };

  const updatePackage = (index: number, updater: (pkg: PackageOption) => PackageOption) => {
    setPackageOptions((prev) => prev.map((pkg, pkgIndex) => (pkgIndex === index ? updater(pkg) : pkg)));
  };

  const addPackage = () => setPackageOptions((prev) => [...prev, createEmptyPackage()]);
  const removePackage = (index: number) => setPackageOptions((prev) => prev.filter((_, pkgIndex) => pkgIndex !== index));

  const addDeparture = (packageIndex: number) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      departures: [...pkg.departures, createEmptyDeparture()],
    }));
  };

  const updateDeparture = (packageIndex: number, departureIndex: number, key: keyof PackageDeparture, value: string) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      departures: pkg.departures.map((departure, index) => (
        index === departureIndex ? { ...departure, [key]: value } : departure
      )),
    }));
  };

  const removeDeparture = (packageIndex: number, departureIndex: number) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      departures: pkg.departures.filter((_, index) => index !== departureIndex),
    }));
  };

  const addPackageNote = (packageIndex: number) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      notes: [...pkg.notes, ''],
    }));
  };

  const updatePackageNote = (packageIndex: number, noteIndex: number, value: string) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      notes: pkg.notes.map((note, index) => (index === noteIndex ? value : note)),
    }));
  };

  const removePackageNote = (packageIndex: number, noteIndex: number) => {
    updatePackage(packageIndex, (pkg) => ({
      ...pkg,
      notes: pkg.notes.filter((_, index) => index !== noteIndex),
    }));
  };

  const addItineraryDay = () => {
    const nextDay = itineraryDays.length > 0
      ? Math.max(...itineraryDays.map((day) => day.day_number)) + 1
      : 1;
    setItineraryDays((prev) => [...prev, createEmptyItineraryDay(nextDay)]);
  };

  const updateItineraryDay = (index: number, updater: (day: ItineraryDay) => ItineraryDay) => {
    setItineraryDays((prev) => prev.map((day, dayIndex) => (dayIndex === index ? updater(day) : day)));
  };

  const removeItineraryDay = (index: number) => {
    setItineraryDays((prev) => prev.filter((_, dayIndex) => dayIndex !== index));
  };

  const addMeal = (dayIndex: number) => {
    updateItineraryDay(dayIndex, (day) => ({ ...day, meals: [...day.meals, ''] }));
  };

  const updateMeal = (dayIndex: number, mealIndex: number, value: string) => {
    updateItineraryDay(dayIndex, (day) => ({
      ...day,
      meals: day.meals.map((meal, index) => (index === mealIndex ? value : meal)),
    }));
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    updateItineraryDay(dayIndex, (day) => ({
      ...day,
      meals: day.meals.filter((_, index) => index !== mealIndex),
    }));
  };

  const addExtra = (dayIndex: number) => {
    updateItineraryDay(dayIndex, (day) => ({
      ...day,
      optional_extras: [...day.optional_extras, ''],
    }));
  };

  const updateExtra = (dayIndex: number, extraIndex: number, value: string) => {
    updateItineraryDay(dayIndex, (day) => ({
      ...day,
      optional_extras: day.optional_extras.map((extra, index) => (index === extraIndex ? value : extra)),
    }));
  };

  const removeExtra = (dayIndex: number, extraIndex: number) => {
    updateItineraryDay(dayIndex, (day) => ({
      ...day,
      optional_extras: day.optional_extras.filter((_, index) => index !== extraIndex),
    }));
  };

  const onSubmit = async (data: PostFormValues) => {
    setSaving(true);
    try {
      const payload: CreatePost = {
        ...data,
        cover_image: coverImage || data.cover_image || null,
        content: content || null,
        journey_overview: journeyOverview.trim() || null,
        package_options: packageOptions
          .map((pkg) => ({
            ...pkg,
            title: pkg.title.trim(),
            route_path: pkg.route_path.trim(),
            duration_label: pkg.duration_label.trim(),
            departures: pkg.departures
              .map((departure) => ({
                ...departure,
                label: departure.label.trim(),
                price: departure.price.trim(),
                secondary_price: departure.secondary_price?.trim() || null,
              }))
              .filter((departure) => departure.label && departure.price),
            notes: normalizeStringArray(pkg.notes),
          }))
          .filter((pkg) => pkg.title && pkg.route_path && pkg.duration_label),
        included_items: normalizeStringArray(includedItems),
        attraction_items: normalizeStringArray(attractionItems),
        itinerary_days: itineraryDays
          .map((day) => ({
            ...day,
            title: day.title.trim(),
            route_label: day.route_label?.trim() || null,
            description: day.description.trim(),
            meals: normalizeStringArray(day.meals),
            optional_extras: normalizeStringArray(day.optional_extras),
          }))
          .filter((day) => day.title && day.description)
          .sort((a, b) => a.day_number - b.day_number),
        travel_tips: travelTips.trim() || null,
        highlighted: data.highlighted ?? false,
      };
      
      let res;
      if (postId) {
        res = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        console.error('Save error:', err);
        return;
      }

      const saved = await res.json();

      // Save library associations
      const savedId: string = saved.id;
      await Promise.all([
        fetch(`/api/posts/${savedId}/inclusions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: libraryInclusions.map((item, i) => ({ ...item, order_index: i })) }),
        }),
        fetch(`/api/posts/${savedId}/highlights`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: libraryHighlights.map((item, i) => ({ ...item, order_index: i })) }),
        }),
      ]);

      onSave?.(savedId);
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Багцын мэдээлэл</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Гарчиг</Label>
              <Input
                id="title"
                placeholder="Багцын гарчиг оруулна уу..."
                {...form.register('title')}
                onChange={handleTitleChange}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="url-slug"
                {...form.register('slug')}
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Товч тайлбар</Label>
              <Textarea
                id="excerpt"
                placeholder="Багцын товч тайлбар..."
                rows={3}
                {...form.register('excerpt')}
              />
            </div>

            <div className="space-y-2">
              <Label>Нүүр зураг</Label>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                folder="covers"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.watch('published')}
                onCheckedChange={(checked) => form.setValue('published', checked)}
              />
              <Label htmlFor="published">Нийтлэх</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="highlighted"
                checked={form.watch('highlighted')}
                onCheckedChange={(checked) => form.setValue('highlighted', checked)}
              />
              <Label htmlFor="highlighted">Онцлох</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Агуулга</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Нийтлэлийн агуулга</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Аяллын багцын агуулгаа бичнэ үү..."
                minHeight={400}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Аяллын ерөнхий замнал ба багцын сонголт
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="journey_overview">Ерөнхий замнал</Label>
              <Input
                id="journey_overview"
                placeholder="Ulaanbaatar - Istanbul - Antalya - Pamukkale"
                value={journeyOverview}
                onChange={(e) => setJourneyOverview(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Багцын дээр харагдах товч маршрутын гарчиг.</p>
            </div>

            <div className="space-y-4">
              {packageOptions.map((pkg, packageIndex) => (
                <div key={`package-${packageIndex}`} className="rounded-xl border p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">Багцын сонголт {packageIndex + 1}</h4>
                      <p className="text-sm text-muted-foreground">Жишээ: 3 хотын аялал, 2 хотын аялал, premium маршрут.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removePackage(packageIndex)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Устгах
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Багцын нэр</Label>
                      <Input
                        value={pkg.title}
                        placeholder="3 хотын аялал"
                        onChange={(e) => updatePackage(packageIndex, (current) => ({ ...current, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Хугацаа</Label>
                      <Input
                        value={pkg.duration_label}
                        placeholder="7 шөнө 8 өдөр"
                        onChange={(e) => updatePackage(packageIndex, (current) => ({ ...current, duration_label: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Маршрут</Label>
                    <Input
                      value={pkg.route_path}
                      placeholder="Улаанбаатар - Истанбул - Анталья - Памуккале"
                      onChange={(e) => updatePackage(packageIndex, (current) => ({ ...current, route_path: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Гарах өдөр ба үнэ</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addDeparture(packageIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Гарах өдөр нэмэх
                      </Button>
                    </div>

                    {(pkg && pkg?.departures) && pkg.departures.map((departure, departureIndex) => (
                      <div key={`departure-${packageIndex}-${departureIndex}`} className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                        <Input
                          value={departure.label}
                          placeholder="3-р сарын 08, 15, 28"
                          onChange={(e) => updateDeparture(packageIndex, departureIndex, 'label', e.target.value)}
                        />
                        <Input
                          value={departure.price}
                          placeholder="4'250'000₮"
                          onChange={(e) => updateDeparture(packageIndex, departureIndex, 'price', e.target.value)}
                        />
                        <Input
                          value={departure.secondary_price ?? ''}
                          placeholder="3'390'000₮"
                          onChange={(e) => updateDeparture(packageIndex, departureIndex, 'secondary_price', e.target.value)}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeDeparture(packageIndex, departureIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Багцын тэмдэглэл</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addPackageNote(packageIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Тэмдэглэл нэмэх
                      </Button>
                    </div>

                    { (pkg && pkg?.notes) && pkg.notes.map((note, noteIndex) => (
                      <div key={`note-${packageIndex}-${noteIndex}`} className="flex gap-2">
                        <Input
                          value={note}
                          placeholder="Хүүхэд - 500,000₮ (0-2 нас)"
                          onChange={(e) => updatePackageNote(packageIndex, noteIndex, e.target.value)}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removePackageNote(packageIndex, noteIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addPackage}>
              <Plus className="mr-2 h-4 w-4" />
              Багцын сонголт нэмэх
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Багтсан зүйлс ба онцлох хэсгүүд
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <LibraryItemPicker
              label="Хөтөлбөрт багтсан зүйлс"
              description="Аяллын үнэд багтсан бүх зүйлс. Цуглуулгаас сонго эсвэл шинэ зүйл үүсгэ."
              type="inclusions"
              items={libraryInclusions}
              onChange={setLibraryInclusions}
            />

            <LibraryItemPicker
              label="Үзвэр / Онцлох зүйлс"
              description="Аялагчдын үзэх гол газрууд, туршлагууд. Цуглуулгаас сонго эсвэл шинэ зүйл үүсгэ."
              type="highlights"
              items={libraryHighlights}
              onChange={setLibraryHighlights}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5" />
              Дэлгэрэнгүй хөтөлбөрийн дараалал
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {itineraryDays.map((day, dayIndex) => (
              <div key={`itinerary-${dayIndex}`} className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">Өдөр {day.day_number}</h4>
                    <p className="text-sm text-muted-foreground">Аяллын нэг өдрийн хөтөлбөр.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeItineraryDay(dayIndex)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Өдөр устгах
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <div className="space-y-2">
                    <Label>Өдрийн дугаар</Label>
                    <Input
                      type="number"
                      min={1}
                      value={day.day_number}
                      onChange={(e) => updateItineraryDay(dayIndex, (current) => ({
                        ...current,
                        day_number: Number(e.target.value) || 1,
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Өдрийн гарчиг</Label>
                    <Input
                      value={day.title}
                      placeholder="Аяллын 1 дахь өдөр. Улаанбаатар – Истанбул – Анталья"
                      onChange={(e) => updateItineraryDay(dayIndex, (current) => ({ ...current, title: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Маршрутын шошго</Label>
                  <Input
                    value={day.route_label ?? ''}
                    placeholder="Улаанбаатар – Истанбул – Анталья"
                    onChange={(e) => updateItineraryDay(dayIndex, (current) => ({ ...current, route_label: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тайлбар</Label>
                  <Textarea
                    rows={7}
                    value={day.description}
                    placeholder="Өдрийн дэлгэрэнгүй хөтөлбөр..."
                    onChange={(e) => updateItineraryDay(dayIndex, (current) => ({ ...current, description: e.target.value }))}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Хоол</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addMeal(dayIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Хоол нэмэх
                      </Button>
                    </div>
                    {day.meals.map((meal, mealIndex) => (
                      <div key={`meal-${dayIndex}-${mealIndex}`} className="flex gap-2">
                        <Input
                          value={meal}
                          placeholder="Өглөөний цай"
                          onChange={(e) => updateMeal(dayIndex, mealIndex, e.target.value)}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeMeal(dayIndex, mealIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Нэмэлт сонголт / Тэмдэглэл</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addExtra(dayIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Нэмэлт мөр нэмэх
                      </Button>
                    </div>
                    {day.optional_extras.map((extra, extraIndex) => (
                      <div key={`extra-${dayIndex}-${extraIndex}`} className="flex gap-2">
                        <Input
                          value={extra}
                          placeholder="Агаарын бөмбөлөг – 150$"
                          onChange={(e) => updateExtra(dayIndex, extraIndex, e.target.value)}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeExtra(dayIndex, extraIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItineraryDay}>
              <Plus className="mr-2 h-4 w-4" />
              Хөтөлбөрийн өдөр нэмэх
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Аяллын зөвлөмж
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="travel_tips">Аяллын зөвлөгөө / Санамж</Label>
              <Textarea
                id="travel_tips"
                rows={6}
                placeholder="Aяллын зөвлөмж, виз, цаг агаар, нэмэлт зөвлөмжүүд..."
                value={travelTips}
                onChange={(e) => setTravelTips(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {postId ? 'Өөрчлөлт хадгалах' : 'Багц үүсгэх'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
