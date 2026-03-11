'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface BaseImageUploadProps {
  folder?: string;
  className?: string;
}

interface SingleImageUploadProps extends BaseImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  multiple?: false;
}

interface MultipleImageUploadProps extends BaseImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  multiple: true;
}

type ImageUploadProps = SingleImageUploadProps | MultipleImageUploadProps;

export default function ImageUpload({ value, onChange, folder = 'uploads', className, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const urlRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    });

    if (!urlRes.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, publicUrl } = await urlRes.json();
    console.log('[upload] publicUrl to be saved:', publicUrl);

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!uploadRes.ok) {
      console.error('[upload] PUT failed:', uploadRes.status, uploadRes.statusText);
      throw new Error(`Failed to upload file: ${uploadRes.status}`);
    }

    console.log('[upload] success, uploaded:', publicUrl);
    return publicUrl as string;
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls = [] as string[];

      for (const file of files) {
        uploadedUrls.push(await uploadFile(file));
      }

      if (multiple) {
        (onChange as (urls: string[]) => void)(uploadedUrls);
      } else {
        (onChange as (url: string) => void)(uploadedUrls[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (multiple) return;
    (onChange as (url: string) => void)('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const singleValue = multiple ? undefined : (value as string | undefined);
  const multipleValueCount = multiple && Array.isArray(value) ? value.length : 0;

  return (
    <div className={className}>
      {singleValue ? (
        <div className="relative">
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
            <Image
              src={singleValue}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {multiple ? `Uploading ${multipleValueCount > 0 ? 'more ' : ''}images...` : 'Uploading...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {multiple ? 'Click to upload images' : 'Click to upload image'}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              {multiple && multipleValueCount > 0 && (
                <p className="text-xs text-muted-foreground">{multipleValueCount} зураг сонгогдсон байна</p>
              )}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
