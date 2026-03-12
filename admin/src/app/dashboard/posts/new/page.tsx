'use client';

import { useRouter } from 'next/navigation';
import PostEditor from '@/components/post-editor';

export default function NewPostPage() {
  const router = useRouter();

  const handleSave = (postId: string) => {
    router.push(`/dashboard/posts/${postId}/edit`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Шинэ багц үүсгэх</h1>
        <p className="text-muted-foreground mt-1">Маршруттай аяллын шинэ багц оруулна</p>
      </div>
      <PostEditor onSave={handleSave} />
    </div>
  );
}
