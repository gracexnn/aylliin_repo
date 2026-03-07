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
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, MapPin, Save, Loader2 } from 'lucide-react';
import MapComponent from './map-component';

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
  const [routeTitle, setRouteTitle] = useState('');
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

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
    [route]
  );

  const openEditDialog = (point: RoutePoint) => {
    setEditingPoint({ ...point });
    setEditDialogOpen(true);
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
          <CardTitle>Create Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Route Title</Label>
            <Input
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              placeholder="e.g., Northern Mongolia Adventure"
            />
          </div>
          <Button onClick={createRoute} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Route
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
            <CardTitle>Route: {route.title}</CardTitle>
            <Badge variant="outline">{route.points.length} points</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              placeholder="Route title"
            />
            <Button variant="outline" onClick={saveRouteTitle} disabled={saving}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on the map to add route points. Click a point to edit its details.
          </p>
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
          />
        </CardContent>
      </Card>

      {/* Route Points List */}
      <Card>
        <CardHeader>
          <CardTitle>Route Points</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {route.points.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Click on the map to add route points
              </p>
            ) : (
              <div className="space-y-2">
                {route.points.map((point, index) => (
                  <motion.div
                    key={point.id ?? index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedPointIndex === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => openEditDialog(point)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{point.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                      </p>
                    </div>
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
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Edit Point Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Route Point</DialogTitle>
          </DialogHeader>
          {editingPoint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingPoint.name}
                  onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingPoint.description}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Interesting Fact</Label>
                <Textarea
                  value={editingPoint.interesting_fact}
                  onChange={(e) => setEditingPoint({ ...editingPoint, interesting_fact: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Recommended Time to Visit</Label>
                <Input
                  value={editingPoint.recommended_time_to_visit}
                  onChange={(e) => setEditingPoint({ ...editingPoint, recommended_time_to_visit: e.target.value })}
                  placeholder="e.g., June - August"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input value={editingPoint.latitude.toFixed(6)} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input value={editingPoint.longitude.toFixed(6)} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePoint} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Point
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
