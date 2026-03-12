'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getLibraryIconOption,
  LIBRARY_ICON_OPTIONS,
  LIBRARY_ICON_PACKS,
  LibraryIcon,
  SUGGESTED_LIBRARY_ICON_OPTIONS,
} from '@/lib/library-icons';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

type IconPackFilter =
'suggested' |
'all' | (typeof LIBRARY_ICON_PACKS)[number]['value'];

const INITIAL_ICON_BATCH = 180;
const ICON_BATCH_SIZE = 120;

const packFilters: Array<{ label: string; value: IconPackFilter }> = [
  { label: 'Санал болгосон', value: 'suggested' },
  { label: 'Бүгд', value: 'all' },
  ...LIBRARY_ICON_PACKS,
];

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activePack, setActivePack] = useState<IconPackFilter>('suggested');
  const [visibleCount, setVisibleCount] = useState(INITIAL_ICON_BATCH);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedIcon = getLibraryIconOption(value);
  const normalizedSearch = search.trim().toLowerCase();

  // Reset visible count during render when filters change (avoids setState-in-effect)
  const filterKey = `${activePack}:${normalizedSearch}:${String(open)}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_ICON_BATCH);
  }

  const filteredIcons = useMemo(() => {
    const sourceIcons =
      activePack === 'suggested' && normalizedSearch
        ? LIBRARY_ICON_OPTIONS
        : activePack === 'suggested'
          ? SUGGESTED_LIBRARY_ICON_OPTIONS
          : activePack === 'all'
            ? LIBRARY_ICON_OPTIONS
            : LIBRARY_ICON_OPTIONS.filter((option) => option.pack === activePack);

    if (!normalizedSearch) {
      return sourceIcons;
    }

    return sourceIcons.filter((option) => option.searchText.includes(normalizedSearch));
  }, [activePack, normalizedSearch]);

  const visibleIcons = filteredIcons.slice(0, visibleCount);
  const hasMoreIcons = visibleIcons.length < filteredIcons.length;

  const loadMoreIcons = useCallback(() => {
    setVisibleCount((current) => {
      if (current >= filteredIcons.length) {
        return current;
      }

      return Math.min(current + ICON_BATCH_SIZE, filteredIcons.length);
    });
  }, [filteredIcons.length]);

  const checkShouldLoadMore = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container || !hasMoreIcons) {
      return;
    }

    const remainingScroll = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (remainingScroll < 220) {
      loadMoreIcons();
    }
  }, [hasMoreIcons, loadMoreIcons]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activePack, normalizedSearch, open]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!open || !container) {
      return;
    }

    const handleScroll = () => {
      checkShouldLoadMore();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    const frame = requestAnimationFrame(() => {
      checkShouldLoadMore();
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [checkShouldLoadMore, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      checkShouldLoadMore();
    });

    return () => cancelAnimationFrame(frame);
  }, [checkShouldLoadMore, open, visibleCount, filteredIcons.length]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full justify-between gap-3 px-3 py-3"
            onClick={() => setOpen(true)}
          >
            <span className="flex min-w-0 items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-foreground">
                {value ? (
                  <LibraryIcon value={value} size={20} className="h-5 w-5" fallbackClassName="text-xl leading-none" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {selectedIcon?.label ?? (value ? value : 'icon сонгох')}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {selectedIcon ? selectedIcon.packLabel : value ? 'Тусгай утга' : `${LIBRARY_ICON_OPTIONS.length}+ icon боломжтой`}
                </span>
              </span>
            </span>
            <span className="text-xs text-muted-foreground">Сонгох</span>
          </Button>

          {value && (
            <Button type="button" variant="outline" size="icon" onClick={() => onChange('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {value && (
          <p className="text-xs text-muted-foreground">
            Хадгалсан утга: <span className="font-mono">{value}</span>
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[85vh] max-h-[85vh] max-w-5xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>icon сонгох</DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col space-y-4 py-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="icon, pack, нэрээр хайх"
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {packFilters.map((pack) => (
                  <Button
                    key={pack.value}
                    type="button"
                    variant={activePack === pack.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePack(pack.value)}
                  >
                    {pack.value === 'suggested' && <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                    {pack.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground">
                  {value ? (
                    <LibraryIcon value={value} size={18} className="h-4.5 w-4.5" fallbackClassName="text-lg leading-none" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{selectedIcon?.label ?? (value || 'icon сонгогдоогүй')}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedIcon?.packLabel ?? (value ? 'Тусгай хадгалсан утга' : 'Доорх сангаас нэгийг сонгоно уу')}
                  </p>
                </div>
              </div>
              {value && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
                  Цэвэрлэх
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                {visibleIcons.length} / {filteredIcons.length} тохирох icon харагдаж байна.
              </p>
              {hasMoreIcons && (
                <p>Доош гүйлгэж үргэлжлүүлэн ачаална.</p>
              )}
            </div>

            {visibleIcons.length === 0 ? (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                Таны хайлттай тохирох icon олдсонгүй.
              </div>
            ) : (
              <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9">
                  {visibleIcons.map((icon) => {
                    const isSelected = value === icon.value;

                    return (
                      <button
                        key={icon.value}
                        type="button"
                        title={`${icon.label} • ${icon.packLabel}`}
                        className={cn(
                          'flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:border-primary/40 hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => {
                          onChange(icon.value);
                          setOpen(false);
                        }}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-background/80 text-foreground shadow-sm">
                          <LibraryIcon value={icon.value} size={18} className="h-4.5 w-4.5" />
                        </span>
                        <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                          {icon.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex min-h-10 items-center justify-center py-3 text-xs text-muted-foreground">
                  {hasMoreIcons ? 'Цааш ачаалж байна...' : 'Бүх icon харагдаж байна.'}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}