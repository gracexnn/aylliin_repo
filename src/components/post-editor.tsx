'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { CreatePostSchema, type CreatePost } from '@/schemas';
import ImageUpload from './image-upload';
import { Save, Loader2 } from 'lucide-react';

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    cover_image?: string | null;
    excerpt?: string | null;
    content?: string | null;
    published?: boolean;
  };
  postId?: string;
  onSave?: (postId: string) => void;
}

export default function PostEditor({ initialData, postId, onSave }: PostEditorProps) {
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? '');

  const form = useForm<CreatePost>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      cover_image: initialData?.cover_image ?? undefined,
      excerpt: initialData?.excerpt ?? '',
      content: initialData?.content ?? '',
      published: initialData?.published ?? false,
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('title', e.target.value);
    if (!postId) {
      form.setValue('slug', slugify(e.target.value));
    }
  };

  const onSubmit = async (data: CreatePost) => {
    setSaving(true);
    try {
      const payload = { ...data, cover_image: coverImage || data.cover_image };
      
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
      onSave?.(saved.id);
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
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter guide title..."
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
                placeholder="url-friendly-slug"
                {...form.register('slug')}
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief description of the guide..."
                rows={3}
                {...form.register('excerpt')}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
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
              <Label htmlFor="published">Published</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">Article Content (Markdown)</Label>
              <Textarea
                id="content"
                placeholder="Write your travel guide content in Markdown..."
                rows={20}
                className="font-mono text-sm"
                {...form.register('content')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {postId ? 'Save Changes' : 'Create Guide'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
