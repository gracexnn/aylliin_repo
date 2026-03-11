'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Search, Loader2, X, Link2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

export interface LibraryLocationRef {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  short_description: string | null;
  description?: string | null;
  cover_image?: string | null;
  gallery?: string[];
  country: string | null;
  region: string | null;
}

interface LocationPickerProps {
  value: string | null | undefined;
  onSelect: (location: LibraryLocationRef | null) => void;
  /** Called when admin picks a location and wants to inherit its coordinates */
  onInheritCoordinates?: (lat: number, lng: number, name: string) => void;
}

export default function LocationPicker({ value, onSelect, onInheritCoordinates }: LocationPickerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locations, setLocations] = useState<LibraryLocationRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LibraryLocationRef | null>(null);

  // Load current selection label if we have an id
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    fetch(`/api/library/locations/${value}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSelected(data); })
      .catch(() => {});
  }, [value]);

  const openDialog = async () => {
    setLoading(true);
    setDialogOpen(true);
    try {
      const res = await fetch('/api/library/locations?active=true');
      if (res.ok) setLocations(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (loc: LibraryLocationRef) => {
    setSelected(loc);
    onSelect(loc);
    onInheritCoordinates?.(loc.latitude, loc.longitude, loc.name);
    setDialogOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    onSelect(null);
  };

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.region && l.region.toLowerCase().includes(search.toLowerCase())) ||
    (l.country && l.country.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
          <Link2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selected.name}</p>
            {(selected.region || selected.country) && (
              <p className="text-xs text-muted-foreground truncate">
                {[selected.region, selected.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleClear}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={openDialog}>
          <MapPin className="mr-2 h-3 w-3" />
          Хадгалсан байршилтай холбох
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Хадгалсан байршил сонгох</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Байршил хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Хадгалсан байршил олдсонгүй.{' '}
                <a href="/dashboard/library/locations" target="_blank" className="underline">Сан хэсэгт шинээр үүсгэнэ үү.</a>
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filtered.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[loc.region, loc.country].filter(Boolean).join(', ')} · {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Болих</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Helper to create a new library location from a map pin */
interface CreateLocationFromPinProps {
  latitude: number;
  longitude: number;
  suggestedName?: string;
  onCreated: (location: LibraryLocationRef) => void;
  onClose: () => void;
}

export function CreateLocationFromPin({ latitude, longitude, suggestedName, onCreated, onClose }: CreateLocationFromPinProps) {
  const [name, setName] = useState(suggestedName ?? '');
  const [slug, setSlug] = useState(suggestedName ? slugify(suggestedName) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Нэр шаардлагатай'); return; }
    if (!slug.trim()) { setError('Slug шаардлагатай'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/library/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), latitude, longitude, active: true }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Үүсгэж чадсангүй'); return; }
      const created: LibraryLocationRef = await res.json();
      onCreated(created);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </div>
      <div className="space-y-1">
        <Label>Байршлын нэр <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
          placeholder="ж.нь., Тяньаньмэний талбай"
        />
      </div>
      <div className="space-y-1">
        <Label>Slug <span className="text-destructive">*</span></Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tiananmen-square" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Болих</Button>
        <Button type="button" size="sm" onClick={handleCreate} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Санд хадгалах
        </Button>
      </div>
    </div>
  );
}
