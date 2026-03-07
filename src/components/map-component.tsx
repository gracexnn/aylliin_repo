'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface RoutePoint {
  id?: string;
  latitude: number;
  longitude: number;
  name: string;
  order_index: number;
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      const ol = await import('ol');
      const TileLayer = (await import('ol/layer/Tile')).default;
      const OSM = (await import('ol/source/OSM')).default;
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

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }

      if (!mapRef.current) return;

      const vectorSource = new VectorSource();

      if (points.length > 0) {
        const sortedPoints = [...points].sort((a, b) => a.order_index - b.order_index);
        const coordinates = sortedPoints.map((p) => fromLonLat([p.longitude, p.latitude]));

        if (coordinates.length > 1) {
          const lineFeature = new Feature(new LineString(coordinates));
          lineFeature.setStyle(
            new Style({
              stroke: new Stroke({ color: '#3b82f6', width: 3, lineDash: [6, 4] }),
            })
          );
          vectorSource.addFeature(lineFeature);
        }

        sortedPoints.forEach((point, i) => {
          const isSelected = i === selectedIndex;
          const pointFeature = new Feature(new Point(fromLonLat([point.longitude, point.latitude])));
          pointFeature.set('pointIndex', i);
          pointFeature.set('pointName', point.name);
          pointFeature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: isSelected ? 12 : 9,
                fill: new Fill({ color: isSelected ? '#ef4444' : '#3b82f6' }),
                stroke: new Stroke({ color: '#ffffff', width: 2 }),
              }),
              text: new Text({
                text: String(i + 1),
                fill: new Fill({ color: '#ffffff' }),
                font: 'bold 11px sans-serif',
                offsetY: 0,
              }),
            })
          );
          vectorSource.addFeature(pointFeature);
        });
      }

      const vectorLayer = new VectorLayer({ source: vectorSource });

      const center =
        points.length > 0
          ? fromLonLat([
              points.reduce((s, p) => s + p.longitude, 0) / points.length,
              points.reduce((s, p) => s + p.latitude, 0) / points.length,
            ])
          : fromLonLat([47.0, 47.9]);

      const map = new ol.Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM() }), vectorLayer],
        view: new View({
          center,
          zoom: points.length > 0 ? 6 : 4,
        }),
      });

      mapInstanceRef.current = map;

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

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, points, interactive, onMapClick, onPointClick, selectedIndex]);

  if (!isClient) {
    return (
      <div style={{ height }} className="bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height }}
      className="w-full rounded-lg overflow-hidden"
      ref={mapRef}
    />
  );
}
