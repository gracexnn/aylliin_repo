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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface LibraryHighlight {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

const emptyForm = { title: '', description: '', active: true };

export default function HighlightsLibraryPage() {
  const [items, setItems] = useState<LibraryHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryHighlight | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/library/highlights');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (item: LibraryHighlight) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description ?? '', active: item.active });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Гарчиг шаардлагатай'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { title: form.title.trim(), description: form.description || null, active: form.active };
      const res = editing
        ? await fetch(`/api/library/highlights/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/library/highlights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Хадгалж чадсангүй'); return; }
      await fetchItems();
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/library/highlights/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Онцлох зүйлсийн сан</h1>
          <p className="text-muted-foreground mt-1">Гайд бүрт дахин ашиглах боломжтой үзвэр, онцлох зүйлс</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ онцлох зүйл
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Одоогоор онцлох зүйл алга.</p>
          <Button className="mt-4" onClick={openCreate}>Эхний онцлох зүйлийг үүсгэх</Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={!item.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                    <Badge variant={item.active ? 'default' : 'secondary'} className="shrink-0">
                      {item.active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </Badge>
                  </div>
                </CardHeader>
                {item.description && (
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
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
                          <AlertDialogTitle>Онцлох зүйлийг устгах</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{item.title}&quot;-ийг устгах уу? Ингэснээр бүх гайдаас холбоос нь сална.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Болих</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Устгах</AlertDialogAction>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Онцлох зүйлийг засах' : 'Шинэ онцлох зүйл'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Гарчиг <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ж.нь., Хятадын Цагаан хэрэм" />
            </div>
            <div className="space-y-1">
              <Label>Тайлбар</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Сонголтоор тайлбар" rows={2} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Идэвхтэй</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Болих</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Өөрчлөлт хадгалах' : 'Үүсгэх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
