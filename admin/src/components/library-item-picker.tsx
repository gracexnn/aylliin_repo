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
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Loader2 } from 'lucide-react';

export interface SelectedLibraryItem {
  inclusion_id?: string;
  highlight_id?: string;
  label_snapshot: string;
  order_index: number;
}

interface LibraryRecord {
  id: string;
  title: string;
  description: string | null;
  icon?: string | null;
  active: boolean;
}

interface LibraryItemPickerProps {
  label: string;
  description?: string;
  /** Either 'inclusions' or 'highlights' */
  type: 'inclusions' | 'highlights';
  items: SelectedLibraryItem[];
  onChange: (items: SelectedLibraryItem[]) => void;
}

export default function LibraryItemPicker({
  label,
  description,
  type,
  items,
  onChange,
}: LibraryItemPickerProps) {
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryRecord[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  const endpoint = `/api/library/${type}`;
  const idKey = type === 'inclusions' ? 'inclusion_id' : 'highlight_id';

  const fetchLibrary = async () => {
    setLibraryLoading(true);
    try {
      const res = await fetch(endpoint);
      if (res.ok) setLibraryItems(await res.json());
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (libraryDialogOpen) fetchLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryDialogOpen]);

  const isSelected = (id: string) =>
    items.some((item) => item[idKey as keyof SelectedLibraryItem] === id);

  const toggleItem = (record: LibraryRecord) => {
    if (isSelected(record.id)) {
      onChange(
        items
          .filter((item) => item[idKey as keyof SelectedLibraryItem] !== record.id)
          .map((item, i) => ({ ...item, order_index: i }))
      );
    } else {
      onChange([
        ...items,
        { [idKey]: record.id, label_snapshot: record.title, order_index: items.length } as SelectedLibraryItem,
      ]);
    }
  };

  const removeItem = (index: number) => {
    onChange(
      items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order_index: i }))
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const next = [...items];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, order_index: i })));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) { setCreateError('Title is required'); return; }
    setCreateSaving(true);
    setCreateError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), active: true }),
      });
      if (!res.ok) { const d = await res.json(); setCreateError(d.error ?? 'Failed to create'); return; }
      const created: LibraryRecord = await res.json();
      // Add immediately to selection
      onChange([
        ...items,
        { [idKey]: created.id, label_snapshot: created.title, order_index: items.length } as SelectedLibraryItem,
      ]);
      setNewTitle('');
      setCreateDialogOpen(false);
    } finally {
      setCreateSaving(false);
    }
  };

  const filtered = libraryItems.filter(
    (r) => r.active && r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Selected items list */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${type}-item-${index}`} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
            <span className="text-xs text-muted-foreground w-5 text-center">{index + 1}</span>
            <span className="flex-1 text-sm">{item.label_snapshot}</span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No items selected. Add from library or create new.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setLibraryDialogOpen(true)}>
          <Search className="mr-2 h-3 w-3" />
          Add from Library
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => { setNewTitle(''); setCreateError(''); setCreateDialogOpen(true); }}>
          <Plus className="mr-2 h-3 w-3" />
          Create New
        </Button>
      </div>

      {/* Library picker dialog */}
      <Dialog open={libraryDialogOpen} onOpenChange={setLibraryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            {libraryLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No items found.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filtered.map((record) => {
                  const selected = isSelected(record.id);
                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => toggleItem(record)}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {'icon' in record && record.icon && (
                        <span>{record.icon}</span>
                      )}
                      <span className="flex-1">{record.title}</span>
                      {selected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLibraryDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New {label.replace(/s$/, '')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter title..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSaving}>
              {createSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create &amp; Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
