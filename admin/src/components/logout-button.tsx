'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: '/login' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      title={collapsed ? 'Гарах' : undefined}
      className={collapsed ? 'w-full justify-center px-0' : 'w-full justify-start gap-2'}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!collapsed && (isLoggingOut ? 'Гарч байна...' : 'Гарах')}
    </Button>
  );
}
