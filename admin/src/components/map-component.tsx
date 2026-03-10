'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TRANSPORT_MODE_MAP } from '@/lib/constants';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BASEMAPS = [
  { id: 'carto-light', name: 'Цайвар', url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' },
  { id: 'carto-dark', name: 'Харанхуй', url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' },
  { id: 'osm', name: 'Гудамж', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' },
];

interface RoutePoint {
  id?: string;
  latitude: number;
  longitude: number;
  name: string;
  order_index: number;
  transport_type?: string;
}

interface MapComponentProps {
  points: RoutePoint[];
  onMapClick?: (lat: number, lng: number) => void;
  onPointClick?: (index: number) => void;
  interactive?: boolean;
  height?: string;
  selectedIndex?: number;
}

export default function MapComponent({
  points,
  onMapClick,
  onPointClick,
  interactive = false,
  height = '400px',
  selectedIndex,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('ol/Map').default | null>(null);
  const vectorSourceRef = useRef<import('ol/source/Vector').default | null>(null);
  const tileLayerRef = useRef<import('ol/layer/Tile').default | null>(null);
  const olModulesRef = useRef<{
    Feature: typeof import('ol/Feature').default;
    Point: typeof import('ol/geom/Point').default;
    LineString: typeof import('ol/geom/LineString').default;
    fromLonLat: (coord: number[]) => number[];
    toLonLat: (coord: number[]) => number[];
    Style: typeof import('ol/style/Style').default;
    CircleStyle: typeof import('ol/style/Circle').default;
    Fill: typeof import('ol/style/Fill').default;
    Stroke: typeof import('ol/style/Stroke').default;
    Text: typeof import('ol/style/Text').default;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [basemap, setBasemap] = useState('carto-light');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aylliin_basemap');
      if (saved && BASEMAPS.some((b) => b.id === saved)) {
        setBasemap(saved);
      }
    }
  }, []);

  const handleBasemapChange = (val: string) => {
    setBasemap(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aylliin_basemap', val);
    }
  };

  // Effect 1: build map once
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    let disposed = false;
    setMapReady(false);

    const buildMap = async () => {
      const ol = await import('ol');
      const TileLayer = (await import('ol/layer/Tile')).default;
      const XYZ = (await import('ol/source/XYZ')).default;
      const VectorLayer = (await import('ol/layer/Vector')).default;
      const VectorSource = (await import('ol/source/Vector')).default;
      const Feature = (await import('ol/Feature')).default;
      const Point = (await import('ol/geom/Point')).default;
      const LineString = (await import('ol/geom/LineString')).default;
      const { fromLonLat, toLonLat } = await import('ol/proj');
      const Style = (await import('ol/style/Style')).default;
      const CircleStyle = (await import('ol/style/Circle')).default;
      const Fill = (await import('ol/style/Fill')).default;
      const Stroke = (await import('ol/style/Stroke')).default;
      const Text = (await import('ol/style/Text')).default;
      const View = (await import('ol/View')).default;

      if (disposed) return;

      olModulesRef.current = { Feature, Point, LineString, fromLonLat, toLonLat, Style, CircleStyle, Fill, Stroke, Text };

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
      if (!mapRef.current) return;

      const vectorSource = new VectorSource();
      vectorSourceRef.current = vectorSource;

      const vectorLayer = new VectorLayer({ source: vectorSource });

      const center =
        points.length > 0
          ? fromLonLat([
              points.reduce((s, p) => s + p.longitude, 0) / points.length,
              points.reduce((s, p) => s + p.latitude, 0) / points.length,
            ])
          : fromLonLat([47.0, 47.9]);

      const initialUrl = BASEMAPS.find((b) => b.id === basemap)?.url || BASEMAPS[0].url;
      const tileLayer = new TileLayer({ source: new XYZ({ url: initialUrl }) });
      tileLayerRef.current = tileLayer;

      const map = new ol.Map({
        target: mapRef.current,
        layers: [tileLayer, vectorLayer],
        view: new View({ center, zoom: points.length > 0 ? 6 : 4 }),
      });

      mapInstanceRef.current = map;
      setMapReady(true);

      if (interactive && onMapClick) {
        map.on('click', (evt) => {
          const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
          if (feature && feature.get('pointIndex') !== undefined) {
            onPointClick?.(feature.get('pointIndex') as number);
          } else {
            const lonLat = toLonLat(evt.coordinate);
            onMapClick(lonLat[1], lonLat[0]);
          }
        });
      } else if (onPointClick) {
        map.on('click', (evt) => {
          const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
          if (feature && feature.get('pointIndex') !== undefined) {
            onPointClick(feature.get('pointIndex') as number);
          }
        });
      }

      map.on('pointermove', (evt) => {
        const hit = map.hasFeatureAtPixel(evt.pixel);
        const targetEl = map.getTargetElement();
        if (targetEl) {
          (targetEl as HTMLElement).style.cursor = hit ? 'pointer' : interactive ? 'crosshair' : '';
        }
      });
    };

    buildMap();

    return () => {
      disposed = true;
      setMapReady(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
      vectorSourceRef.current = null;
      olModulesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, interactive]);

  // Effect 2: update features only — no map rebuild, no tile flicker
  useEffect(() => {
    const vs = vectorSourceRef.current;
    const m = olModulesRef.current;
    if (!vs || !m) return;

    const { Feature, Point, LineString, fromLonLat, Style, CircleStyle, Fill, Stroke, Text } = m;

    const getColor = (mode?: string) =>
      TRANSPORT_MODE_MAP[mode as keyof typeof TRANSPORT_MODE_MAP]?.color ?? '#3b82f6';

    vs.clear();

    if (points.length === 0) return;

    const sorted = [...points].sort((a, b) => a.order_index - b.order_index);

    // Per-segment lines colored by the departure point transport_type
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = fromLonLat([sorted[i].longitude, sorted[i].latitude]);
      const to = fromLonLat([sorted[i + 1].longitude, sorted[i + 1].latitude]);
      const color = getColor(sorted[i].transport_type);
      const seg = new Feature(new LineString([from, to]));
      seg.setStyle(new Style({ stroke: new Stroke({ color, width: 3, lineDash: [6, 4] }) }));
      vs.addFeature(seg);
    }

    // Point markers colored by each point's own transport_type
    sorted.forEach((point, i) => {
      const isSelected = i === selectedIndex;
      const color = getColor(point.transport_type);
      const pf = new Feature(new Point(fromLonLat([point.longitude, point.latitude])));
      pf.set('pointIndex', i);
      pf.setStyle(
        new Style({
          image: new CircleStyle({
            radius: isSelected ? 12 : 9,
            fill: new Fill({ color: isSelected ? '#ef4444' : color }),
            stroke: new Stroke({ color: '#ffffff', width: isSelected ? 3 : 2 }),
          }),
          text: new Text({
            text: String(i + 1),
            fill: new Fill({ color: '#ffffff' }),
            font: `bold ${isSelected ? 12 : 11}px sans-serif`,
            offsetY: 0,
          }),
        })
      );
      vs.addFeature(pf);
    });
  }, [points, selectedIndex, mapReady]);

  // Effect 3: update basemap dynamically
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const updateBasemap = async () => {
      const XYZ = (await import('ol/source/XYZ')).default;
      const url = BASEMAPS.find((b) => b.id === basemap)?.url || BASEMAPS[0].url;
      tileLayerRef.current?.setSource(new XYZ({ url }));
    };
    updateBasemap();
  }, [basemap]);

  if (!isClient) {
    return (
      <div style={{ height }} className="bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Газрын зураг ачаалж байна...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height }}
      className="w-full relative rounded-lg overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur border rounded-md shadow-sm">
        <Select value={basemap} onValueChange={handleBasemapChange}>
          <SelectTrigger className="w-45 border-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Select basemap" />
          </SelectTrigger>
          <SelectContent>
            {BASEMAPS.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </motion.div>
  );
}

