import type { TransportMode } from '@/schemas';

export interface TransportModeOption {
  value: TransportMode;
  label: string;
  icon: string;
  description: string;
  /** Hex color used to render the route line and markers on the map */
  color: string;
}

export const TRANSPORT_MODE_OPTIONS: TransportModeOption[] = [
  {
    value: 'WALKING',
    label: 'Walking',
    icon: '🚶',
    description: 'On foot',
    color: '#22c55e', // green
  },
  {
    value: 'CYCLING',
    label: 'Cycling',
    icon: '🚴',
    description: 'By bicycle',
    color: '#84cc16', // lime
  },
  {
    value: 'DRIVING',
    label: 'Driving',
    icon: '🚗',
    description: 'By car',
    color: '#f97316', // orange
  },
  {
    value: 'BUS',
    label: 'Bus',
    icon: '🚌',
    description: 'By bus',
    color: '#eab308', // yellow
  },
  {
    value: 'TRAM',
    label: 'Tram',
    icon: '🚊',
    description: 'By tram or streetcar',
    color: '#06b6d4', // cyan
  },
  {
    value: 'SUBWAY',
    label: 'Subway / Metro',
    icon: '🚇',
    description: 'By underground rail',
    color: '#8b5cf6', // violet
  },
  {
    value: 'TRAIN',
    label: 'Train',
    icon: '🚂',
    description: 'By train or rail',
    color: '#6366f1', // indigo
  },
  {
    value: 'BOAT',
    label: 'Boat',
    icon: '⛵',
    description: 'By boat or sailboat',
    color: '#3b82f6', // blue
  },
  {
    value: 'FERRY',
    label: 'Ferry',
    icon: '⛴️',
    description: 'By ferry or water taxi',
    color: '#0ea5e9', // sky
  },
  {
    value: 'PLANE',
    label: 'Plane',
    icon: '✈️',
    description: 'By airplane',
    color: '#ec4899', // pink
  },
  {
    value: 'HELICOPTER',
    label: 'Helicopter',
    icon: '🚁',
    description: 'By helicopter',
    color: '#f43f5e', // rose
  },
];

export const TRANSPORT_MODE_MAP = Object.fromEntries(
  TRANSPORT_MODE_OPTIONS.map((opt) => [opt.value, opt])
) as Record<TransportMode, TransportModeOption>;

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
    url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '\u00a9 OpenStreetMap contributors \u00a9 CARTO',
  },
  {
    id: 'carto-dark',
    label: 'Dark',
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '\u00a9 OpenStreetMap contributors \u00a9 CARTO',
  },
  {
    id: 'osm',
    label: 'OSM',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '\u00a9 OpenStreetMap contributors',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles \u00a9 Esri',
  },
  {
    id: 'topo',
    label: 'Topo',
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '\u00a9 OpenStreetMap contributors, SRTM | OpenTopoMap',
  },
];

export const DEFAULT_BASEMAP_ID = 'carto-light';
