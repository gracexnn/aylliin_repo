'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/logout-button';
import { LayoutDashboard, FileText, Map, Calendar, Users, ChevronLeft, ChevronRight, Sun, Moon, Library, MapPin, Sparkles, ListChecks, Globe, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Багцууд', icon: FileText },
  { href: '/dashboard/departure-sessions', label: 'Явах товууд', icon: Calendar },
  { href: '/dashboard/bookings', label: 'Захиалгууд', icon: Users },
];

const settingsNavItems = [
  { href: '/dashboard/landing-settings', label: 'Нүүр тохиргоо', icon: Globe },
];

const libraryNavItems = [
  { href: '/dashboard/library/inclusions', label: 'Багтсан зүйлс', icon: ListChecks },
  { href: '/dashboard/library/highlights', label: 'Онцлох зүйлс', icon: Sparkles },
  { href: '/dashboard/library/locations', label: 'Байршлууд', icon: MapPin },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300 shrink-0 md:relative',
          mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0',
          !mobileOpen && collapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center justify-between border-b px-4', collapsed ? 'md:justify-center' : '')}>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0" onClick={() => setMobileOpen(false)}>
            <Map className="h-6 w-6 shrink-0 text-primary" />
            <AnimatePresence initial={false}>
              {(!collapsed || mobileOpen) && (
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
          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
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
                onClick={() => setMobileOpen(false)}
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

          {/* Settings section */}
          <div className={cn('pt-3', collapsed ? 'flex flex-col items-center' : '')}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="settings-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 px-3 pb-1"
                >
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Тохиргоо</span>
                </motion.div>
              )}
            </AnimatePresence>
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                onClick={() => setMobileOpen(false)}
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
                        key={`settings-label-${item.href}`}
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
          </div>

          {/* Library section */}
          <div className={cn('pt-3', collapsed ? 'flex flex-col items-center' : '')}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="library-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 px-3 pb-1"
                >
                  <Library className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Цуглуулга</span>
                </motion.div>
              )}
            </AnimatePresence>
            {libraryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                onClick={() => setMobileOpen(false)}
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
                        key={`lib-label-${item.href}`}
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
          </div>
        </nav>

        {/* Footer */}
        <div className={cn('border-t p-2', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
          {/* Theme toggle */}
          <button
            suppressHydrationWarning
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              collapsed ? 'w-full justify-center px-0' : 'w-full'
            )}
          >
            {!mounted ? (
              <Sun className="h-4 w-4 shrink-0 opacity-0" aria-hidden />
            ) : isDark ? (
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
          className="hidden md:flex absolute -right-3 top-18 z-10 h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile top nav */}
        <div className="md:hidden flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Map className="h-6 w-6 text-primary" />
            Aylal Админ
          </Link>
          <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-muted-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
