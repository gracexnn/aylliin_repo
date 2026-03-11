'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MapPin, CheckCircle2, X, Crosshair } from 'lucide-react';
import { BASEMAPS, DEFAULT_BASEMAP_ID } from '@/lib/constants';

export interface GeocoderResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  boundingbox: [string, string, string, string];
}

export interface GeocoderPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface GeocoderSearchProps {
  onSelect: (lat: number, lng: number, displayName: string) => void;
  /** Original saved coordinates shown while editing — amber anchor pin */
  originalPoint?: GeocoderPoint | null;
  /** Live form coordinates for the current create/edit session — emerald working pin */
  sessionPoint?: GeocoderPoint | null;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const MAX_RESULTS = 20;

export default function GeocoderSearch({
  onSelect,
  originalPoint = null,
  sessionPoint = null,
}: GeocoderSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocoderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [highlighted, setHighlighted] = useState<GeocoderResult | null>(null);

  // â”€â”€ Map refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('ol/Map').default | null>(null);
  const vectorSourceRef = useRef<import('ol/source/Vector').default | null>(null);
  const olRef = useRef<{
    Feature: typeof import('ol/Feature').default;
    Point: typeof import('ol/geom/Point').default;
    fromLonLat: (c: number[]) => number[];
    toLonLat: (c: number[]) => number[];
    Style: typeof import('ol/style/Style').default;
    CircleStyle: typeof import('ol/style/Circle').default;
    Fill: typeof import('ol/style/Fill').default;
    Stroke: typeof import('ol/style/Stroke').default;
    Text: typeof import('ol/style/Text').default;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState(DEFAULT_BASEMAP_ID);
  const [pickMode, setPickMode] = useState(false);
  const pickModeRef = useRef(false);
  const tileLayerRef = useRef<import('ol/layer/Tile').default<import('ol/source/XYZ').default> | null>(null);
  const XYZRef = useRef<typeof import('ol/source/XYZ').default | null>(null);

  // Keep pickModeRef in sync so OL click handler can read it without stale closure
  useEffect(() => { pickModeRef.current = pickMode; }, [pickMode]);

  // sessionPoint only counts when it has actually moved away from originalPoint
  const EPS = 1e-6;
  const sessionDistinct: GeocoderPoint | null =
    sessionPoint &&
    !(
      originalPoint &&
      Math.abs(sessionPoint.lat - originalPoint.lat) < EPS &&
      Math.abs(sessionPoint.lng - originalPoint.lng) < EPS
    )
      ? sessionPoint
      : null;

  // Build map once
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    let disposed = false;

    (async () => {
      const ol = await import('ol');
      const TileLayer = (await import('ol/layer/Tile')).default;
      const XYZ = (await import('ol/source/XYZ')).default;
      XYZRef.current = XYZ;
      const VectorLayer = (await import('ol/layer/Vector')).default;
      const VectorSource = (await import('ol/source/Vector')).default;
      const View = (await import('ol/View')).default;
      const Feature = (await import('ol/Feature')).default;
      const Point = (await import('ol/geom/Point')).default;
      const { fromLonLat, toLonLat } = await import('ol/proj');
      const Style = (await import('ol/style/Style')).default;
      const CircleStyle = (await import('ol/style/Circle')).default;
      const Fill = (await import('ol/style/Fill')).default;
      const Stroke = (await import('ol/style/Stroke')).default;
      const Text = (await import('ol/style/Text')).default;

      if (disposed || !mapRef.current) return;

      olRef.current = { Feature, Point, fromLonLat, toLonLat, Style, CircleStyle, Fill, Stroke, Text };

      const vectorSource = new VectorSource();
      vectorSourceRef.current = vectorSource;

      const tileLayer = new TileLayer({
            source: new XYZ({ url: BASEMAPS.find(b => b.id === DEFAULT_BASEMAP_ID)!.url }),
          });
          tileLayerRef.current = tileLayer;

      const map = new ol.Map({
        target: mapRef.current,
        layers: [
          tileLayer,
          new VectorLayer({ source: vectorSource }),
        ],
        view: new View({ center: fromLonLat([103, 47]), zoom: 4 }),
        controls: [],
      });

      // Click: pick-mode takes priority, then pin selection
      map.on('click', (evt) => {
        if (pickModeRef.current) {
          const coord = map.getCoordinateFromPixel(evt.pixel);
          const [lng, lat] = toLonLat(coord);
          mapRef.current?.dispatchEvent(
            new CustomEvent('geocoder-map-pick', { detail: { lat, lng } })
          );
          return;
        }
        const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
        if (feature) {
          const idx = feature.get('resultIndex') as number | undefined;
          if (idx !== undefined) {
            mapRef.current?.dispatchEvent(
              new CustomEvent('geocoder-pin-click', { detail: idx })
            );
          }
        }
      });

      map.on('pointermove', (evt) => {
        const el = map.getTargetElement() as HTMLElement | null;
        if (!el) return;
        if (pickModeRef.current) { el.style.cursor = 'crosshair'; return; }
        const hit = map.hasFeatureAtPixel(evt.pixel);
        el.style.cursor = hit ? 'pointer' : '';
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    })();

    return () => {
      disposed = true;
      mapInstanceRef.current?.setTarget(undefined);
      mapInstanceRef.current = null;
      vectorSourceRef.current = null;
      tileLayerRef.current = null;
      XYZRef.current = null;
      olRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ---- Swap basemap source when activeBasemap changes ----------------------
  useEffect(() => {
    if (!tileLayerRef.current || !XYZRef.current) return;
    const basemap = BASEMAPS.find((b) => b.id === activeBasemap);
    if (!basemap) return;
    tileLayerRef.current.setSource(new XYZRef.current({ url: basemap.url }));
  }, [activeBasemap]);

  // Listen for pin-click events (avoids stale closure over results)
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      setResults((r) => {
        setHighlighted(r[idx] ?? null);
        return r;
      });
    };
    el.addEventListener('geocoder-pin-click', handler);
    return () => el.removeEventListener('geocoder-pin-click', handler);
  }, [mapReady]);

  // Listen for map-pick events (free click in pick mode)
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const { lat, lng } = (e as CustomEvent<{ lat: number; lng: number }>).detail;
      onSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setPickMode(false);
    };
    el.addEventListener('geocoder-map-pick', handler);
    return () => el.removeEventListener('geocoder-map-pick', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // â”€â”€ Re-draw pins whenever results / highlighted change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const vs = vectorSourceRef.current;
    const ol = olRef.current;
    const map = mapInstanceRef.current;
    if (!vs || !ol || !map || !mapReady) return;

    const { Feature, Point, fromLonLat, Style, CircleStyle, Fill, Stroke, Text } = ol;
    vs.clear();

    // Helper: pill-style text label
    const pill = (
      text: string,
      textColor: string,
      bgColor: string,
      borderColor: string,
      bold: boolean,
      offsetY: number
    ) =>
      new Style({
        text: new Text({
          text,
          font: (bold ? 'bold ' : '') + '10px sans-serif',
          fill: new Fill({ color: textColor }),
          backgroundFill: new Fill({ color: bgColor }),
          backgroundStroke: new Stroke({ color: borderColor, width: 1 }),
          padding: [2, 6, 2, 6],
          offsetY,
          textBaseline: 'middle',
        }),
      });

    // 1. Search result pins — slate dots, no numbers
    results.forEach((r, i) => {
      const isActive = highlighted?.place_id === r.place_id;
      const coord = fromLonLat([parseFloat(r.lon), parseFloat(r.lat)]);
      const pin = new Feature(new Point(coord));
      pin.set('resultIndex', i);

      const rawLabel = r.display_name.split(',')[0].trim();
      const label = rawLabel.length > 20 ? rawLabel.slice(0, 18) + '\u2026' : rawLabel;
      const labelOffsetY = i % 2 === 0 ? 18 : -18;

      if (isActive) {
        pin.setStyle([
          new Style({
            image: new CircleStyle({
              radius: 11,
              fill: new Fill({ color: '#3b82f6' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 }),
            }),
          }),
          pill(label, '#1d4ed8', 'rgba(219,234,254,0.95)', '#93c5fd', true, labelOffsetY),
        ]);
      } else {
        pin.setStyle([
          new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: '#94a3b8' }),
              stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
            }),
          }),
          pill(label, '#475569', 'rgba(255,255,255,0.90)', '#e2e8f0', false, labelOffsetY),
        ]);
      }
      vs.addFeature(pin);
    });

    // 2. Original saved point — amber anchor
    if (originalPoint) {
      const coord = fromLonLat([originalPoint.lng, originalPoint.lat]);
      const pin = new Feature(new Point(coord));
      const label = (originalPoint.label ?? '\u0425\u0430\u0434\u0433\u0430\u043b\u0441\u0430\u043d').slice(0, 20);
      pin.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 17,
            fill: new Fill({ color: 'rgba(245,158,11,0)' }),
            stroke: new Stroke({ color: 'rgba(245,158,11,0.4)', width: 2 }),
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 11,
            fill: new Fill({ color: '#f59e0b' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
          }),
        }),
        pill(label, '#92400e', 'rgba(254,243,199,0.95)', '#fcd34d', true, -26),
      ]);
      vs.addFeature(pin);
    }

    // 3. Session working point — emerald live pin (only when distinct from originalPoint)
    if (sessionDistinct) {
      const coord = fromLonLat([sessionDistinct.lng, sessionDistinct.lat]);
      const pin = new Feature(new Point(coord));
      const label = sessionDistinct.label ? sessionDistinct.label.slice(0, 20) : '\u041e\u0434\u043e\u043e\u0433\u0438\u0439\u043d';
      pin.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 19,
            fill: new Fill({ color: 'rgba(16,185,129,0)' }),
            stroke: new Stroke({ color: 'rgba(16,185,129,0.35)', width: 2.5 }),
          }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: '#10b981' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
          }),
        }),
        pill(label, '#065f46', 'rgba(209,250,229,0.95)', '#6ee7b7', true, 28),
      ]);
      vs.addFeature(pin);
    }

    // Auto-fit view
    if (results.length > 0 && !highlighted) {
      (async () => {
        const { transformExtent } = await import('ol/proj');
        const lats = results.map((r) => parseFloat(r.lat));
        const lons = results.map((r) => parseFloat(r.lon));
        const extent = transformExtent(
          [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)],
          'EPSG:4326', 'EPSG:3857'
        );
        map.getView().fit(extent, { padding: [36, 36, 36, 36], maxZoom: 14, duration: 400 });
      })();
    } else if (results.length === 0 && sessionDistinct && !originalPoint) {
      map.getView().animate({ center: fromLonLat([sessionDistinct.lng, sessionDistinct.lat]), zoom: 13, duration: 300 });
    } else if (results.length === 0 && originalPoint && !sessionDistinct) {
      map.getView().animate({ center: fromLonLat([originalPoint.lng, originalPoint.lat]), zoom: 12, duration: 300 });
    } else if (results.length === 0 && originalPoint && sessionDistinct) {
      (async () => {
        const { transformExtent } = await import('ol/proj');
        const extent = transformExtent(
          [Math.min(originalPoint.lng, sessionDistinct.lng), Math.min(originalPoint.lat, sessionDistinct.lat),
           Math.max(originalPoint.lng, sessionDistinct.lng), Math.max(originalPoint.lat, sessionDistinct.lat)],
          'EPSG:4326', 'EPSG:3857'
        );
        map.getView().fit(extent, { padding: [48, 48, 48, 48], maxZoom: 14, duration: 300 });
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, highlighted, originalPoint, sessionPoint, mapReady]);

  // â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults([]);
    setHighlighted(null);
    try {
      const url = new URL(NOMINATIM_URL);
      url.searchParams.set('q', q);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', String(MAX_RESULTS));
      url.searchParams.set('addressdetails', '0');

      const res = await fetch(url.toString(), {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'aylliin-admin/1.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GeocoderResult[] = await res.json();
      setResults(data);
      if (data.length === 0) setError('Үр дүн олдсонгүй. Өөр хайлтаар оролдоно уу.');
    } catch (e) {
      setError('Geocoder холбогдож чадсангүй.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!highlighted) return;
    onSelect(parseFloat(highlighted.lat), parseFloat(highlighted.lon), highlighted.display_name);
    setResults([]);
    setHighlighted(null);
    setQuery('');
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      {/* â”€â”€ Map â€” always in DOM â”€â”€ */}
      <div className="relative rounded-md overflow-hidden border" style={{ height: '240px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Empty hint */}
        {results.length === 0 && !loading && !originalPoint && !sessionDistinct && !pickMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded">
              Хайлт хийж байршил оноо
            </p>
          </div>
        )}

        {/* Legend */}
        {(originalPoint || sessionDistinct || results.length > 0) && (
          <div className="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
            {originalPoint && (
              <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-amber-700">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white shrink-0" />
                Хадгалсан
              </div>
            )}
            {sessionDistinct && (
              <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-emerald-700">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shrink-0" />
                Одоогийн
              </div>
            )}
            {results.length > 0 && (
              <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-slate-600">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white shrink-0" />
                {results.length} үр дүн
              </div>
            )}
          </div>
        )}

        {/* Pick mode active overlay */}
        {pickMode && (
          <div className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-emerald-500 rounded-md">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
              Дарж байршил тодорхойл
            </div>
          </div>
        )}

        {/* Pick mode toggle button — top-left */}
        <button
          type="button"
          onClick={() => setPickMode((v) => !v)}
          title="Газраас байршил сонгох"
          className={`absolute top-2 left-2 rounded p-1.5 border backdrop-blur-sm transition-colors ${
            pickMode
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-background/80 text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>

        {/* Dismiss search — top-right, only when results present and not in pick mode */}
        {results.length > 0 && !pickMode && (
          <button
            type="button"
            onClick={() => { setResults([]); setHighlighted(null); }}
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Basemap switcher */}
        <div className="absolute bottom-2 right-2 flex gap-1 pointer-events-auto">
          {BASEMAPS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBasemap(b.id)}
              className={`px-1.5 py-0.5 text-[9px] rounded backdrop-blur-sm border transition-colors ${
                activeBasemap === b.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background/80 text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Search bar â”€â”€ */}
      <div className="flex gap-2">
        <Input
          placeholder="ж.нь., Terelj National Park"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" onClick={handleSearch} disabled={loading} className="h-8 shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* â”€â”€ Selected result card â€” appears only when a pin is clicked â”€â”€ */}
      {highlighted && (
        <div className="flex items-start gap-2 rounded-md border bg-background px-3 py-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-snug">
              {highlighted.display_name.split(',').slice(0, 3).join(',').trim()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {parseFloat(highlighted.lat).toFixed(5)}, {parseFloat(highlighted.lon).toFixed(5)}
            </p>
          </div>
          <Button type="button" size="sm" className="h-7 text-xs px-2 shrink-0 bg-emerald-600 hover:bg-emerald-700" onClick={handleApply}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Авах
          </Button>
        </div>
      )}
    </div>
  );
}

