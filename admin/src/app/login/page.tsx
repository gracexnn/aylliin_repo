'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, Mail, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getSafeRedirectTarget(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/dashboard';
  }

  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => getSafeRedirectTarget(searchParams.get('redirectTo')),
    [searchParams]
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (!result || result.error) {
        setError('Имэйл эсвэл нууц үг буруу байна.');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Нэвтрэх үед алдаа гарлаа.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Map className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Aylal Админ</CardTitle>
            <CardDescription>Админ хэсэг рүү нэвтрэхийн тулд имэйл хаяг болон нууц үгээ оруулна уу.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Нууц үг"
                  className="pl-10"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Анхны админ хэрэглэгч үүсгэхийн тулд `auth:seed-admin` командыг нэг удаа ажиллуулна уу.
            </p>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Шалгаж байна...' : 'Нэвтрэх'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-muted/30 px-4" />}>
      <LoginForm />
    </Suspense>
  );
}
