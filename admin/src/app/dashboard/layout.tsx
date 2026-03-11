'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/logout-button';
import { LayoutDashboard, FileText, Map, Calendar, Users, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

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
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'relative flex h-dvh flex-col border-r bg-card transition-all duration-300 shrink-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b px-4', collapsed ? 'justify-center' : 'gap-2')}>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Map className="h-6 w-6 shrink-0 text-primary" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="logo-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-lg whitespace-nowrap overflow-hidden"
                >
                  Aylal Админ
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key={`label-${item.href}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn('border-t p-2', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
          {/* Theme toggle */}
          <button
            onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              collapsed ? 'w-full justify-center px-0' : 'w-full'
            )}
          >
            {isDark ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="theme-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {isDark ? 'Цайвар горим' : 'Харанхуй горим'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <LogoutButton collapsed={collapsed} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                key="version"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="px-1 text-xs text-muted-foreground"
              >
                Аяллын админ v1.0
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-18 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
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
