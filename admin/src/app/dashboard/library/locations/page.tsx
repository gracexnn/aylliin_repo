'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';
import ImageUpload from '@/components/image-upload';

interface LibraryLocation {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  cover_image: string | null;
  gallery: string[];
  region: string | null;
  country: string | null;
  tags: string[];
  active: boolean;
  created_at: string;
}

function emptyForm() {
  return {
    name: '',
    slug: '',
    short_description: '',
    description: '',
    latitude: '',
    longitude: '',
    cover_image: '',
    gallery: [] as string[],
    region: '',
    country: '',
    tags: '',
    active: true,
  };
}

export default function LocationsLibraryPage() {
  const [items, setItems] = useState<LibraryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryLocation | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/library/locations');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (item: LibraryLocation) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      short_description: item.short_description ?? '',
      description: item.description ?? '',
      latitude: String(item.latitude),
      longitude: String(item.longitude),
      cover_image: item.cover_image ?? '',
      gallery: item.gallery ?? [],
      region: item.region ?? '',
      country: item.country ?? '',
      tags: item.tags.join(', '),
      active: item.active,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, name, ...(!editing ? { slug: slugify(name) } : {}) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) { setError('Latitude must be between -90 and 90'); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setError('Longitude must be between -180 and 180'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        short_description: form.short_description || null,
        description: form.description || null,
        latitude: lat,
        longitude: lng,
        cover_image: form.cover_image || null,
        gallery: form.gallery,
        region: form.region || null,
        country: form.country || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        active: form.active,
      };

      const res = editing
        ? await fetch(`/api/library/locations/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/library/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return; }
      await fetchItems();
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/library/locations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const addGalleryImage = (url: string) => {
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Locations Library</h1>
          <p className="text-muted-foreground mt-1">Reusable saved locations for route points</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Location
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No locations yet.</p>
          <Button className="mt-4" onClick={openCreate}>Create First Location</Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={!item.active ? 'opacity-60' : ''}>
                {item.cover_image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cover_image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
                    <Badge variant={item.active ? 'default' : 'secondary'} className="shrink-0">
                      {item.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    {(item.region || item.country) && (
                      <span className="ml-1">· {[item.region, item.country].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                </CardHeader>
                {item.short_description && (
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.short_description}</p>
                  </CardContent>
                )}
                {item.tags.length > 0 && (
                  <CardContent className="pb-2 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
                <CardContent className="pt-0">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Location</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete &quot;{item.name}&quot;? Route points linked to this location will lose the reference.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Location' : 'New Location'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Tiananmen Square" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g., tiananmen-square" />
              </div>
              <div className="space-y-1">
                <Label>Latitude <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="39.9042" step="any" />
              </div>
              <div className="space-y-1">
                <Label>Longitude <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="116.4074" step="any" />
              </div>
              <div className="space-y-1">
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g., Beijing" />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g., China" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Brief one-liner" />
            </div>
            <div className="space-y-1">
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." rows={3} />
            </div>
            <div className="space-y-1">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g., historical, landmark, UNESCO" />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                value={form.cover_image}
                onChange={(url) => setForm({ ...form, cover_image: url })}
              />
            </div>
            <div className="space-y-2">
              <Label>Photo Gallery</Label>
              <div className="grid grid-cols-3 gap-2">
                {form.gallery.map((url, i) => (
                  <div key={i} className="relative group aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-white text-xs transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                value=""
                onChange={addGalleryImage}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Active</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
