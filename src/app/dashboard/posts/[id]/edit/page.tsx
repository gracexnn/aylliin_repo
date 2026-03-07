'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostEditor from '@/components/post-editor';
import RouteEditor from '@/components/route-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Post {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  content: string | null;
  published: boolean;
}

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Guide</h1>
        <p className="text-muted-foreground mt-1">{post.title}</p>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="route">Route &amp; Map</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <PostEditor initialData={post} postId={postId} />
        </TabsContent>
        <TabsContent value="route">
          <RouteEditor postId={postId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
