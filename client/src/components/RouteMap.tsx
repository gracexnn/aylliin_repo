'use client'

import { useEffect, useRef, useState } from 'react'
import type { Route, RoutePoint, TransportMode, ItineraryDay } from '@/lib/types'

const BASEMAPS = [
    { id: 'carto-dark',  label: 'Харанхуй', url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',  tilePixelRatio: 2 },
    { id: 'carto-light', label: 'Цайвар',   url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', tilePixelRatio: 2 },
    { id: 'osm',         label: 'Гудамж',   url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',              tilePixelRatio: 1 },
] as const

type BasemapId = typeof BASEMAPS[number]['id']

const LS_KEY = 'aylliin_basemap'

const TRANSPORT_VISUALS: Record<TransportMode, {
    color: string
    icon: string
    curve: number
    dash?: number[]
    width: number
    glow: number
    badge?: boolean
}> = {
    WALKING:    { color: '#22c55e', icon: '🚶', curve: 0.04, width: 3, glow: 12, dash: [4, 6] },
    DRIVING:    { color: '#f97316', icon: '🚗', curve: 0.02, width: 3, glow: 12 },
    CYCLING:    { color: '#84cc16', icon: '🚴', curve: 0.03, width: 3, glow: 12, dash: [8, 5] },
    BUS:        { color: '#eab308', icon: '🚌', curve: 0.03, width: 3, glow: 12, dash: [10, 5] },
    TRAIN:      { color: '#6366f1', icon: '🚂', curve: 0.07, width: 3, glow: 14, dash: [12, 4] },
    TRAM:       { color: '#06b6d4', icon: '🚊', curve: 0.06, width: 3, glow: 14, dash: [10, 4] },
    SUBWAY:     { color: '#8b5cf6', icon: '🚇', curve: 0.05, width: 3, glow: 14, dash: [6, 4] },
    BOAT:       { color: '#3b82f6', icon: '⛵', curve: 0.16, width: 3, glow: 16, dash: [7, 7], badge: true },
    FERRY:      { color: '#0ea5e9', icon: '⛴️', curve: 0.14, width: 3, glow: 16, dash: [9, 7], badge: true },
    PLANE:      { color: '#ec4899', icon: '✈️', curve: 0.28, width: 3, glow: 18, dash: [12, 8], badge: true },
    HELICOPTER: { color: '#f43f5e', icon: '🚁', curve: 0.22, width: 3, glow: 18, dash: [8, 8], badge: true },
}

/** One distinct color per itinerary day (1-indexed, repeating). */
const DAY_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
    '#10b981', '#6366f1', '#d946ef', '#84cc16',
]

function getDayColor(dayNumber: number): string {
    return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length]
}

function getTransportVisual(mode?: TransportMode) {
    return TRANSPORT_VISUALS[mode ?? 'WALKING']
}

/** Day color if assigned, otherwise transport color. */
function getPointColor(point: RoutePoint): string {
    if (point.day_number != null) return getDayColor(point.day_number)
    return getTransportVisual(point.transport_type).color
}

function buildSegmentPath(
    from: Pick<RoutePoint, 'longitude' | 'latitude'>,
    to: Pick<RoutePoint, 'longitude' | 'latitude'>,
    curveStrength: number,
    steps = 28,
) {
    const start: [number, number] = [from.longitude, from.latitude]
    const end: [number, number] = [to.longitude, to.latitude]

    const dx = end[0] - start[0]
    const dy = end[1] - start[1]
    const distance = Math.max(Math.hypot(dx, dy), 0.0001)

    if (curveStrength <= 0.025) {
        return [start, end]
    }

    const nx = -dy / distance
    const ny = dx / distance
    const bendDirection = Math.sin(start[0] * 7.13 + start[1] * 5.71 + end[0] * 3.17) >= 0 ? 1 : -1
    const bend = distance * curveStrength * bendDirection

    const control: [number, number] = [
        (start[0] + end[0]) / 2 + nx * bend,
        (start[1] + end[1]) / 2 + ny * bend,
    ]

    return Array.from({ length: steps }, (_, index) => {
        const t = index / (steps - 1)
        const mt = 1 - t
        return [
            mt * mt * start[0] + 2 * mt * t * control[0] + t * t * end[0],
            mt * mt * start[1] + 2 * mt * t * control[1] + t * t * end[1],
        ] as [number, number]
    })
}

type PopupState = {
    point: RoutePoint
    routeTitle: string
    x: number   // px from left of container
    y: number   // px from top of container
} | null

type OLModules = {
    Feature: typeof import('ol/Feature').default
    PointGeom: typeof import('ol/geom/Point').default
    LineString: typeof import('ol/geom/LineString').default
    fromLonLat: (c: number[]) => number[]
    Style: typeof import('ol/style/Style').default
    CircleStyle: typeof import('ol/style/Circle').default
    Fill: typeof import('ol/style/Fill').default
    Stroke: typeof import('ol/style/Stroke').default
    Text: typeof import('ol/style/Text').default
}

interface RouteMapProps {
    routes: Route[]
    itineraryDays?: ItineraryDay[]
}

export default function RouteMap({ routes, itineraryDays = [] }: RouteMapProps) {
    const mapRef          = useRef<HTMLDivElement>(null)
    const mapInstanceRef  = useRef<import('ol/Map').default | null>(null)
    const tileLayerRef    = useRef<import('ol/layer/Tile').default<import('ol/source/XYZ').default> | null>(null)
    const vectorSourceRef = useRef<import('ol/source/Vector').default | null>(null)
    const olRef           = useRef<OLModules | null>(null)

    const [loaded,          setLoaded]         = useState(false)
    const [mapReady,        setMapReady]        = useState(false)
    const [popup,           setPopup]           = useState<PopupState>(null)
    const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null)
    const [basemap,         setBasemap]         = useState<BasemapId>(() => {
        if (typeof window === 'undefined') return 'carto-dark'
        const saved = localStorage.getItem(LS_KEY)
        return (BASEMAPS.some((b) => b.id === saved) ? saved : 'carto-dark') as BasemapId
    })

    const allPoints  = routes.flatMap((r) => r.points)
    const sortedDays = [...itineraryDays].sort((a, b) => a.day_number - b.day_number)

    useEffect(() => {
        if (!mapRef.current || typeof window === 'undefined') return
        if (allPoints.length === 0) return

        let cancelled = false

        const build = async () => {
            const ol           = await import('ol')
            const View         = (await import('ol/View')).default
            const TileLayer    = (await import('ol/layer/Tile')).default
            const XYZ          = (await import('ol/source/XYZ')).default
            const VectorLayer  = (await import('ol/layer/Vector')).default
            const VectorSource = (await import('ol/source/Vector')).default
            const Feature      = (await import('ol/Feature')).default
            const PointGeom    = (await import('ol/geom/Point')).default
            const LineString   = (await import('ol/geom/LineString')).default
            const { fromLonLat } = await import('ol/proj')
            const Style        = (await import('ol/style/Style')).default
            const CircleStyle  = (await import('ol/style/Circle')).default
            const Fill         = (await import('ol/style/Fill')).default
            const Stroke       = (await import('ol/style/Stroke')).default
            const Text         = (await import('ol/style/Text')).default

            if (cancelled || !mapRef.current) return

            olRef.current = { Feature, PointGeom, LineString, fromLonLat, Style, CircleStyle, Fill, Stroke, Text }

            const vectorSource = new VectorSource()
            vectorSourceRef.current = vectorSource

            const center = fromLonLat([
                allPoints.reduce((s, p) => s + p.longitude, 0) / allPoints.length,
                allPoints.reduce((s, p) => s + p.latitude,  0) / allPoints.length,
            ])

            const bm = BASEMAPS.find((b) => b.id === basemap) ?? BASEMAPS[0]
            const tileLayer = new TileLayer({
                source: new XYZ({
                    url: bm.url,
                    tilePixelRatio: bm.tilePixelRatio,
                    attributions:
                        '© <a href="https://carto.com" target="_blank">CARTO</a> ' +
                        '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a>',
                }),
            })
            tileLayerRef.current = tileLayer

            const map = new ol.Map({
                target: mapRef.current!,
                layers: [tileLayer, new VectorLayer({ source: vectorSource, zIndex: 10 })],
                view:   new View({ center, zoom: 4 }),
                controls: [],
            })

            mapInstanceRef.current = map
            setMapReady(true)

            map.on('click', (evt) => {
                const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f, { hitTolerance: 10 })
                if (feature) {
                    const pt    = feature.get('pointData') as RoutePoint | undefined
                    const title = feature.get('routeTitle') as string | undefined
                    if (pt) {
                        const coord = (feature.getGeometry() as unknown as { getCoordinates(): number[] }).getCoordinates()
                        const pixel = map.getPixelFromCoordinate(coord)
                        setPopup({ point: pt, routeTitle: title ?? '', x: pixel[0], y: pixel[1] })
                        return
                    }
                }
                setPopup(null)
            })

            map.on('moveend', () => {
                setPopup((prev) => {
                    if (!prev) return null
                    const coord = fromLonLat([prev.point.longitude, prev.point.latitude])
                    const pixel = map.getPixelFromCoordinate(coord)
                    return { ...prev, x: pixel[0], y: pixel[1] }
                })
            })

            map.on('pointermove', (evt) => {
                const hit = map.hasFeatureAtPixel(evt.pixel, { hitTolerance: 10 })
                const el  = map.getTargetElement()
                if (el) el.style.cursor = hit ? 'pointer' : ''
            })
        }

        build()

        return () => {
            cancelled = true
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(undefined)
                mapInstanceRef.current = null
            }
            vectorSourceRef.current = null
            olRef.current = null
            setMapReady(false)
            setLoaded(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Effect 2: redraw features when day filter changes ────────────────
    useEffect(() => {
        const vs  = vectorSourceRef.current
        const m   = olRef.current
        const map = mapInstanceRef.current
        if (!vs || !m || !map) return

        const { Feature, PointGeom, LineString, fromLonLat, Style, CircleStyle, Fill, Stroke, Text } = m

        const isDayFilterActive = activeDayFilter != null
        const isPointActive = (pt: RoutePoint) =>
            !isDayFilterActive || pt.day_number === activeDayFilter

        vs.clear()

        routes.forEach((route) => {
            const pts = [...route.points].sort((a, b) => a.order_index - b.order_index)
            if (pts.length < 1) return

            if (pts.length >= 2) {
                for (let i = 0; i < pts.length - 1; i++) {
                    const fromPt = pts[i]
                    const toPt   = pts[i + 1]
                    const visual = getTransportVisual(fromPt.transport_type)
                    const segActive = !isDayFilterActive ||
                        (fromPt.day_number === activeDayFilter && toPt.day_number === activeDayFilter)
                    const color = segActive ? getPointColor(fromPt) : '#374151'

                    const lonLatPath = buildSegmentPath(fromPt, toPt, visual.curve)
                    const coords = lonLatPath.map(([lon, lat]) => fromLonLat([lon, lat]))

                    if (segActive) {
                        const glow = new Feature({ geometry: new LineString(coords) })
                        glow.setStyle(new Style({
                            stroke: new Stroke({ color: color + '33', width: visual.glow, lineCap: 'round', lineJoin: 'round' }),
                            zIndex: 1,
                        }))
                        vs.addFeature(glow)
                    }

                    const line = new Feature({ geometry: new LineString(coords) })
                    line.setStyle(new Style({
                        stroke: new Stroke({
                            color: segActive ? color : color + '55',
                            width: segActive ? visual.width : 1.5,
                            lineDash: visual.dash,
                            lineCap: 'round',
                            lineJoin: 'round',
                        }),
                        zIndex: 2,
                    }))
                    vs.addFeature(line)

                    if (visual.badge && segActive) {
                        const midCoord = coords[Math.floor(coords.length / 2)]
                        const badge = new Feature({ geometry: new PointGeom(midCoord) })
                        badge.setStyle(new Style({
                            image: new CircleStyle({
                                radius: 11,
                                fill:   new Fill({ color: '#020617dd' }),
                                stroke: new Stroke({ color, width: 2 }),
                            }),
                            text: new Text({
                                text: visual.icon,
                                font: '12px "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                offsetY: 0.5,
                            }),
                            zIndex: 4,
                        }))
                        vs.addFeature(badge)
                    }
                }
            }

            pts.forEach((pt, idx) => {
                const active  = isPointActive(pt)
                const color   = getPointColor(pt)
                const isFirst = idx === 0
                const isLast  = idx === pts.length - 1
                const radius  = (isFirst || isLast) ? 16 : (active ? 13 : 8)

                const f = new Feature({
                    geometry:   new PointGeom(fromLonLat([pt.longitude, pt.latitude])),
                    pointData:  pt,
                    routeTitle: route.title,
                })
                f.setStyle(new Style({
                    image: new CircleStyle({
                        radius,
                        fill:   new Fill({ color: active ? color : '#374151' }),
                        stroke: new Stroke({ color: active ? '#ffffff' : '#4b5563', width: active ? 2.5 : 1.5 }),
                    }),
                    text: new Text({
                        text:    String(idx + 1),
                        fill:    new Fill({ color: active ? '#ffffff' : '#6b7280' }),
                        font:    'bold 11px Inter, ui-sans-serif, sans-serif',
                        offsetY: 0.5,
                    }),
                    zIndex: (isFirst || isLast) ? 20 : (active ? 10 : 5),
                }))
                vs.addFeature(f)
            })
        })

        const extent = vs.getExtent()
        if (extent && isFinite(extent[0])) {
            map.getView().fit(extent as [number, number, number, number], {
                padding: [70, 70, 70, 70],
                maxZoom: isDayFilterActive ? 10 : 16,
                duration: isDayFilterActive ? 500 : 0,
            })
        }

        setLoaded(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady, activeDayFilter])

    // ── Effect 3: swap basemap without rebuild ────────────────────────────
    useEffect(() => {
        const tl = tileLayerRef.current
        if (!tl) return
        const swap = async () => {
            const XYZ = (await import('ol/source/XYZ')).default
            const bm  = BASEMAPS.find((b) => b.id === basemap) ?? BASEMAPS[0]
            tl.setSource(new XYZ({ url: bm.url, tilePixelRatio: bm.tilePixelRatio }))
        }
        swap()
        localStorage.setItem(LS_KEY, basemap)
    }, [basemap])

    if (allPoints.length === 0) return null

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-gray-900">
            {/* Map canvas */}
            <div ref={mapRef} className="w-full h-[520px]" />

            {/* Loading shimmer */}
            {!loaded && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full border-[3px] border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-gray-500 text-sm">Газрын зураг ачаалж байна…</p>
                </div>
            )}

            {/* Day filter bar */}
            {sortedDays.length > 0 && loaded && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-950/85 backdrop-blur-md px-3 py-2 rounded-full shadow-lg">
                    <button
                        onClick={() => setActiveDayFilter(null)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            activeDayFilter === null
                                ? 'bg-white text-gray-900 shadow'
                                : 'text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Бүгд
                    </button>
                    {sortedDays.map((day) => {
                        const color    = getDayColor(day.day_number)
                        const isActive = activeDayFilter === day.day_number
                        return (
                            <button
                                key={day.day_number}
                                onClick={() => setActiveDayFilter(isActive ? null : day.day_number)}
                                title={day.title || `Өдөр ${day.day_number}`}
                                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                style={{
                                    backgroundColor: isActive ? color : 'transparent',
                                    color:           isActive ? '#fff' : color,
                                    boxShadow:       isActive ? `0 0 0 2px ${color}` : undefined,
                                }}
                            >
                                Өдөр {day.day_number}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Route legend — top-left */}
            {routes.length >= 1 && loaded && (
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none max-w-[calc(100vw-8rem)] sm:max-w-[240px]">
                    {routes.map((route, idx) => (
                        <div
                            key={route.id}
                            className="flex items-center gap-2 bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-medium shadow min-w-0"
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }}
                            />
                            <span className="truncate">{route.title}</span>
                            <span className="text-white/40 shrink-0">·</span>
                            <span className="text-white/50 shrink-0">{route.points.length} цэг</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Top-right: basemap chooser */}
            {loaded && (
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-0.5 bg-gray-950/80 backdrop-blur-md p-1 rounded-full shadow">
                        {BASEMAPS.map((bm) => (
                            <button
                                key={bm.id}
                                onClick={() => setBasemap(bm.id)}
                                title={bm.label}
                                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                                    basemap === bm.id
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <span className="hidden sm:inline">{bm.label}</span>
                                <span className="sm:hidden">{bm.label.charAt(0)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Popup */}
            {popup && (
                <div
                    className="absolute pointer-events-auto"
                    style={{ left: popup.x, top: popup.y, transform: 'translate(-50%, calc(-100% - 18px))' }}
                >
                    <div className="relative bg-gray-950/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl px-4 py-3.5 w-[240px]">
                        {popup.point.day_number != null && (
                            <p
                                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                style={{ color: getDayColor(popup.point.day_number) }}
                            >
                                Өдөр {popup.point.day_number}
                            </p>
                        )}
                        {!popup.point.day_number && popup.routeTitle && (
                            <p className="text-primary-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                                {popup.routeTitle}
                            </p>
                        )}
                        <p className="text-white font-bold text-sm leading-snug mb-1">
                            {popup.point.name}
                        </p>
                        {popup.point.description && (
                            <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                                {popup.point.description}
                            </p>
                        )}
                        {popup.point.recommended_time_to_visit && (
                            <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                                <span>🕐</span>
                                {popup.point.recommended_time_to_visit}
                            </p>
                        )}
                        {popup.point.interesting_fact && (
                            <p className="text-gray-500 text-xs mt-1.5 italic line-clamp-2">
                                ✦ {popup.point.interesting_fact}
                            </p>
                        )}
                        <button
                            onClick={() => setPopup(null)}
                            className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
                            aria-label="Хаах"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-3 h-3 rotate-45 bg-gray-950/95 border-r border-b border-white/10 shadow" />
                </div>
            )}

            <div className="absolute bottom-5 right-2 text-[10px] text-white/25 pointer-events-none">
                © CARTO · © OpenStreetMap contributors
            </div>
        </div>
    )
}
