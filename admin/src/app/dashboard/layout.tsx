'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/logout-button';
import { LayoutDashboard, FileText, Map, Calendar, Users } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Багцууд', icon: FileText },
  { href: '/dashboard/departure-sessions', label: 'Явах товууд', icon: Calendar },
  { href: '/dashboard/bookings', label: 'Захиалгууд', icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="flex h-dvh w-64 shrink-0 flex-col border-r bg-card">
        <div className="p-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Aylal Админ</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-3">
            <LogoutButton />
          </div>
          <p className="text-xs text-muted-foreground">Аяллын админ v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
