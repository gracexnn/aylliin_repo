import type { TransportMode } from '@/schemas';

export interface TransportModeOption {
  value: TransportMode;
  label: string;
  icon: string;
  description: string;
  /** Hex color used to render the route line and markers on the map */
  color: string;
  /** Curvature strength used for segment rendering. */
  curve: number;
  /** Optional dash pattern for route segments. */
  dash?: number[];
  /** Segment stroke width in px. */
  width: number;
  /** Glow stroke width in px for active segments. */
  glow: number;
  /** Whether to render an icon badge on the segment midpoint. */
  badge?: boolean;
}

export const TRANSPORT_MODE_OPTIONS: TransportModeOption[] = [
  {
    value: 'WALKING',
    label: 'Явган',
    icon: '🚶',
    description: 'Алхалт',
    color: '#22c55e', // green
    curve: 0.04,
    dash: [4, 6],
    width: 3,
    glow: 12,
  },
  {
    value: 'CYCLING',
    label: 'Дугуй',
    icon: '🚴',
    description: 'Унадаг дугуй',
    color: '#84cc16', // lime
    curve: 0.03,
    dash: [8, 5],
    width: 3,
    glow: 12,
  },
  {
    value: 'DRIVING',
    label: 'Машин',
    icon: '🚗',
    description: 'By car',
    color: '#f97316', // orange
    curve: 0.02,
    width: 3,
    glow: 12,
  },
  {
    value: 'BUS',
    label: 'Автобус',
    icon: '🚌',
    description: 'By bus',
    color: '#eab308', // yellow
    curve: 0.03,
    dash: [10, 5],
    width: 3,
    glow: 12,
  },
  {
    value: 'TRAM',
    label: 'Трамвай',
    icon: '🚊',
    description: 'By tram or streetcar',
    color: '#06b6d4', // cyan
    curve: 0.06,
    dash: [10, 4],
    width: 3,
    glow: 14,
  },
  {
    value: 'SUBWAY',
    label: 'Метро',
    icon: '🚇',
    description: 'By underground rail',
    color: '#8b5cf6', // violet
    curve: 0.05,
    dash: [6, 4],
    width: 3,
    glow: 14,
  },
  {
    value: 'TRAIN',
    label: 'Галт тэрэг',
    icon: '🚂',
    description: 'By train or rail',
    color: '#6366f1', // indigo
    curve: 0.07,
    dash: [12, 4],
    width: 3,
    glow: 14,
  },
  {
    value: 'BOAT',
    label: 'Завь',
    icon: '⛵',
    description: 'By boat or sailboat',
    color: '#3b82f6', // blue
    curve: 0.16,
    dash: [7, 7],
    width: 3,
    glow: 16,
  },
  {
    value: 'FERRY',
    label: 'Усан онгоц',
    icon: '⛴️',
    description: 'By ferry or water taxi',
    color: '#0ea5e9', // sky
    curve: 0.14,
    dash: [9, 7],
    width: 3,
    glow: 16,
  },
  {
    value: 'PLANE',
    label: 'Нислэг',
    icon: '✈️',
    description: 'By airplane',
    color: '#ec4899', // pink
    curve: 0.28,
    dash: [12, 8],
    width: 3,
    glow: 18,
  },
  {
    value: 'HELICOPTER',
    label: 'Нисдэг тэрэг',
    icon: '🚁',
    description: 'By helicopter',
    color: '#f43f5e', // rose
    curve: 0.22,
    dash: [8, 8],
    width: 3,
    glow: 18,
  },
];

export const TRANSPORT_MODE_MAP = Object.fromEntries(
  TRANSPORT_MODE_OPTIONS.map((opt) => [opt.value, opt])
) as Record<TransportMode, TransportModeOption>;

export function getTransportVisual(mode?: TransportMode): TransportModeOption {
  return TRANSPORT_MODE_MAP[mode ?? 'WALKING'];
}

/** A repeating palette of colors for itinerary day numbers (1-indexed). */
export const DAY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#d946ef', // fuchsia
  '#84cc16', // lime
];

/** Returns a hex color string for a given itinerary day number (1-based). */
export function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

// ---------------------------------------------------------------------------
// Basemaps
// ---------------------------------------------------------------------------

export interface BasemapOption {
  id: string;
  label: string;
  url: string;
  /** Attribution text shown in map footers / legal notices */
  attribution?: string;
}

export const BASEMAPS: BasemapOption[] = [
  {
    id: 'carto-light',
    label: 'Light',
    url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
  },
  {
    id: 'carto-dark',
    label: 'Dark',
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  },
  {
    id: 'osm',
    label: 'OSM',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  },
  {
    id: 'topo',
    label: 'Topo',
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
  },
];

export const DEFAULT_BASEMAP_ID = 'carto-light';
