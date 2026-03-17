'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Save, Loader2 } from 'lucide-react';
import MapComponent from './map-component';
import LocationPicker, { type LibraryLocationRef } from './location-picker';
import { TRANSPORT_MODE_OPTIONS, TRANSPORT_MODE_MAP, getDayColor } from '@/lib/constants';
import type { TransportMode, ItineraryDay } from '@/schemas';

interface RoutePoint {
  id?: string;
  route_id?: string;
  order_index: number;
  latitude: number;
  longitude: number;
  name: string;
  description: string;
  interesting_fact: string;
  recommended_time_to_visit: string;
  images: string[];
  transport_type: TransportMode;
  day_number?: number | null;
  location_id?: string | null;
}

interface Route {
  id: string;
  post_id: string;
  title: string;
  points: RoutePoint[];
}

interface RouteEditorProps {
  postId: string;
}

export default function RouteEditor({ postId }: RouteEditorProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingTemplatePoint, setAddingTemplatePoint] = useState(false);
  const [routeTitle, setRouteTitle] = useState('');
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null);
  const [templateLocations, setTemplateLocations] = useState<LibraryLocationRef[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    fetchRoute();
    fetchItineraryDays();
    fetchTemplateLocations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchTemplateLocations = async () => {
    try {
      const res = await fetch('/api/library/locations?active=true');
      if (!res.ok) return;
      const locations: LibraryLocationRef[] = await res.json();
      setTemplateLocations(locations);
    } catch {
      // ignore – template dropdown is optional
    }
  };

  const fetchItineraryDays = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) return;
      const data = await res.json();
      const days: ItineraryDay[] = (data?.itinerary_days ?? []);
      setItineraryDays([...days].sort((a, b) => a.day_number - b.day_number));
    } catch {
      // ignore – itinerary days are optional for the route editor
    }
  };

  const fetchRoute = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/route-data`);
      const routes = await res.json();
      if (routes.length > 0) {
        setRoute(routes[0]);
        setRouteTitle(routes[0].title);
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, title: routeTitle || 'Main Route' }),
      });
      if (res.ok) {
        const newRoute = await res.json();
        setRoute({ ...newRoute, points: [] });
        setRouteTitle(newRoute.title);
      }
    } catch (error) {
      console.error('Failed to create route:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveRouteTitle = async () => {
    if (!route) return;
    setSaving(true);
    try {
      await fetch(`/api/routes/${route.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: routeTitle }),
      });
      setRoute((prev) => prev ? { ...prev, title: routeTitle } : prev);
    } catch (error) {
      console.error('Failed to update route title:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      if (!route) return;

      const newPoint: RoutePoint = {
        route_id: route.id,
        order_index: route.points.length,
        latitude: lat,
        longitude: lng,
        name: `Point ${route.points.length + 1}`,
        description: '',
        interesting_fact: '',
        recommended_time_to_visit: '',
        images: [],
        transport_type: 'WALKING',
        day_number: activeDayFilter ?? null,
      };

      try {
        const res = await fetch('/api/route-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPoint),
        });
        if (res.ok) {
          const savedPoint = await res.json();
          setRoute((prev) =>
            prev ? { ...prev, points: [...prev.points, savedPoint] } : prev
          );
        }
      } catch (error) {
        console.error('Failed to add point:', error);
      }
    },
    [route, activeDayFilter]
  );

  const addPointFromTemplate = async (locationId: string) => {
    if (!route) return;

    const template = templateLocations.find((loc) => loc.id === locationId);
    if (!template) return;

    setAddingTemplatePoint(true);
    try {
      const newPoint: RoutePoint = {
        route_id: route.id,
        order_index: route.points.length,
        latitude: template.latitude,
        longitude: template.longitude,
        name: template.name,
        description: template.description ?? template.short_description ?? '',
        interesting_fact: '',
        recommended_time_to_visit: '',
        images: buildPointImagesFromLocation(template),
        transport_type: 'WALKING',
        day_number: activeDayFilter ?? null,
        location_id: template.id,
      };

      const res = await fetch('/api/route-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoint),
      });

      if (res.ok) {
        const savedPoint = await res.json();
        setRoute((prev) =>
          prev ? { ...prev, points: [...prev.points, savedPoint] } : prev
        );
        setSelectedPointIndex(route.points.length);
      }
    } catch (error) {
      console.error('Failed to add template point:', error);
    } finally {
      setAddingTemplatePoint(false);
      setSelectedTemplateId('');
    }
  };

  const openEditDialog = (point: RoutePoint) => {
    setEditingPoint({ ...point });
    setEditDialogOpen(true);
  };

  const buildPointImagesFromLocation = (loc: LibraryLocationRef) => {
    const merged = [loc.cover_image, ...(loc.gallery ?? [])].filter(
      (url): url is string => Boolean(url)
    );

    return Array.from(new Set(merged));
  };

  const applyLocationTemplate = (point: RoutePoint, loc: LibraryLocationRef | null): RoutePoint => {
    if (!loc) {
      return { ...point, location_id: null };
    }

    return {
      ...point,
      location_id: loc.id,
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: loc.name,
      description: loc.description ?? loc.short_description ?? point.description,
      images: buildPointImagesFromLocation(loc),
    };
  };

  const savePoint = async () => {
    if (!editingPoint || !route) return;
    setSaving(true);
    try {
      if (editingPoint.id) {
        const res = await fetch(`/api/route-points/${editingPoint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPoint),
        });
        if (res.ok) {
          const updated = await res.json();
          setRoute((prev) =>
            prev
              ? {
                  ...prev,
                  points: prev.points.map((p) => (p.id === updated.id ? updated : p)),
                }
              : prev
          );
        }
      }
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to save point:', error);
    } finally {
      setSaving(false);
    }
  };

  const quickUpdatePointDay = async (point: RoutePoint, dayNumber: number | null) => {
    if (!point.id || !route) return;
    try {
      const res = await fetch(`/api/route-points/${point.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...point, day_number: dayNumber }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRoute((prev) =>
          prev
            ? {
                ...prev,
                points: prev.points.map((p) => (p.id === updated.id ? updated : p)),
              }
            : prev
        );
      }
    } catch (error) {
      console.error('Failed to quick update point day:', error);
    }
  };

  const deletePoint = async (pointId: string) => {
    try {
      await fetch(`/api/route-points/${pointId}`, { method: 'DELETE' });
      setRoute((prev) =>
        prev
          ? {
              ...prev,
              points: prev.points
                .filter((p) => p.id !== pointId)
                .map((p, i) => ({ ...p, order_index: i })),
            }
          : prev
      );
    } catch (error) {
      console.error('Failed to delete point:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!route) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Маршрут үүсгэх</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Маршрутын нэр</Label>
            <Input
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              placeholder="жишээ нь: Турк улсын гурван хотын аялал"
            />
          </div>
          <Button onClick={createRoute} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Маршрут үүсгэх
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Маршрут: {route.title}</CardTitle>
            <Badge variant="outline">{route.points.length} цэг</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              placeholder="Маршрутын нэр"
            />
            <Button variant="outline" onClick={saveRouteTitle} disabled={saving}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-2 md:max-w-md">
            <Label>Хадгалсан байршлаас шууд цэг нэмэх</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={(value) => {
                setSelectedTemplateId(value);
                void addPointFromTemplate(value);
              }}
              disabled={addingTemplatePoint || templateLocations.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={templateLocations.length === 0 ? 'Хадгалсан байршил алга' : ''} />
              </SelectTrigger>
              <SelectContent>
                {templateLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {[location.name, location.region, location.country].filter(Boolean).join(' · ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Day filter bar */}
          {itineraryDays.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveDayFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeDayFilter === null
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                }`}
              >
                Бүгд
              </button>
              {itineraryDays.map((day) => {
                const color = getDayColor(day.day_number);
                const isActive = activeDayFilter === day.day_number;
                return (
                  <button
                    key={day.day_number}
                    type="button"
                    onClick={() => setActiveDayFilter(isActive ? null : day.day_number)}
                    className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                    style={{
                      borderColor: color,
                      color: isActive ? '#fff' : color,
                      backgroundColor: isActive ? color : 'transparent',
                    }}
                    title={day.title || `Өдөр ${day.day_number}`}
                  >
                    Өдөр {day.day_number}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <MapComponent
            points={route.points}
            onMapClick={handleMapClick}
            onPointClick={(index) => {
              setSelectedPointIndex(index);
              openEditDialog(route.points[index]);
            }}
            interactive={true}
            height="500px"
            selectedIndex={selectedPointIndex ?? undefined}
            activeDayFilter={activeDayFilter}
          />
        </CardContent>
      </Card>

      {/* Route Points List */}
      <Card>
        <CardHeader>
          <CardTitle>Маршрутын цэгүүд</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {route.points.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Газрын зураг дээр дарж цэг нэмнэ үү
              </p>
            ) : (
              <div className="space-y-2">
                {route.points.map((point, index) => {
                  const mode = TRANSPORT_MODE_MAP[point.transport_type];
                  return (
                    <motion.div
                      key={point.id ?? index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedPointIndex === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      } ${
                        activeDayFilter != null && point.day_number !== activeDayFilter
                          ? 'opacity-40'
                          : ''
                      }`}
                      onClick={() => openEditDialog(point)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: point.day_number != null
                            ? getDayColor(point.day_number)
                            : (mode?.color ?? '#3b82f6'),
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{point.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={point.day_number != null ? String(point.day_number) : 'none'}
                          onValueChange={(v) => quickUpdatePointDay(point, v === 'none' ? null : Number(v))}
                        >
                          <SelectTrigger 
                            className="h-8 w-28 text-xs font-medium" 
                            style={point.day_number != null ? {
                              borderColor: getDayColor(point.day_number),
                              color: getDayColor(point.day_number)
                            } : {}}
                          >
                            <SelectValue placeholder="Өдөргүй" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">— Өдөргүй —</span>
                            </SelectItem>
                            {itineraryDays.map((day) => (
                              <SelectItem key={day.day_number} value={String(day.day_number)}>
                                Өдөр {day.day_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 gap-1 text-xs"
                        style={{ borderColor: mode?.color, color: mode?.color }}
                      >
                        {mode?.icon} {mode?.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (point.id) deletePoint(point.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Edit Point Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Маршрутын цэг засах</DialogTitle>
          </DialogHeader>
          {editingPoint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Хадгалсан байршилтай холбох</Label>
                <LocationPicker
                  value={editingPoint.location_id}
                  onSelect={(loc: LibraryLocationRef | null) =>
                    setEditingPoint((prev) => (prev ? applyLocationTemplate(prev, loc) : prev))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Сонгосон хадгалсан байршил нь энэ цэгийн template болж, нэр, координат, тайлбар, зургуудыг автоматаар бөглөнө.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Нэр</Label>
                <Input
                  value={editingPoint.name}
                  onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Дараагийн цэг хүртэлх тээвэр</Label>
                <Select
                  value={editingPoint.transport_type}
                  onValueChange={(v) =>
                    setEditingPoint({ ...editingPoint, transport_type: v as TransportMode })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSPORT_MODE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {itineraryDays.length > 0 && (
                <div className="space-y-2">
                  <Label>Хөтөлбөрийн өдөр</Label>
                  <Select
                    value={editingPoint.day_number != null ? String(editingPoint.day_number) : 'none'}
                    onValueChange={(v) =>
                      setEditingPoint({
                        ...editingPoint,
                        day_number: v === 'none' ? null : Number(v),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Өдөр сонгох..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">— Өдөр оноогүй —</span>
                      </SelectItem>
                      {itineraryDays.map((day) => (
                        <SelectItem key={day.day_number} value={String(day.day_number)}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: getDayColor(day.day_number) }}
                            />
                            <span>Өдөр {day.day_number}</span>
                            {day.title && (
                              <span className="text-muted-foreground text-xs truncate max-w-40">
                                — {day.title}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Тайлбар</Label>
                <Textarea
                  value={editingPoint.description}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Сонирхолтой баримт</Label>
                <Textarea
                  value={editingPoint.interesting_fact}
                  onChange={(e) => setEditingPoint({ ...editingPoint, interesting_fact: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Очих тохиромжтой хугацаа</Label>
                <Input
                  value={editingPoint.recommended_time_to_visit}
                  onChange={(e) => setEditingPoint({ ...editingPoint, recommended_time_to_visit: e.target.value })}
                  placeholder="жишээ нь: 6 - 8-р сар"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Өргөрөг</Label>
                  <Input value={editingPoint.latitude.toFixed(6)} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Уртраг</Label>
                  <Input value={editingPoint.longitude.toFixed(6)} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Болих
            </Button>
            <Button onClick={savePoint} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Цэг хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
