'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
    MdDirectionsWalk,
    MdDirectionsCar,
    MdDirectionsBike,
    MdDirectionsBus,
    MdTrain,
    MdTram,
    MdSubway,
    MdDirectionsBoat,
    MdFlight,
    MdFlightTakeoff,
} from 'react-icons/md'
import { FiClock, FiStar, FiMapPin, FiX, FiChevronLeft, FiChevronRight, FiCoffee, FiFlag, FiInfo } from 'react-icons/fi'
import type { Route, RoutePoint, TransportMode, ItineraryDay } from '@/lib/types'
import { getDayColor, getPointColor, getTransportVisual, hexToRgba } from '@/lib/route-utils'

const TransportIcons: Record<TransportMode, React.ElementType> = {
    WALKING:    MdDirectionsWalk,
    DRIVING:    MdDirectionsCar,
    CYCLING:    MdDirectionsBike,
    BUS:        MdDirectionsBus,
    TRAIN:      MdTrain,
    TRAM:       MdTram,
    SUBWAY:     MdSubway,
    BOAT:       MdDirectionsBoat,
    FERRY:      MdDirectionsBoat,
    PLANE:      MdFlight,
    HELICOPTER: MdFlightTakeoff,
}

interface LightboxState {
    images: string[]
    index: number
}

interface RouteTimelineProps {
    routes: Route[]
    itineraryDays?: ItineraryDay[]
    travelTips?: string | null
    activeDayFilter?: number | null
}

function DayGroup({ dayNum, points, dayData, openLightbox, activeDayFilter }: { dayNum: number, points: RoutePoint[], dayData?: ItineraryDay, openLightbox: (images: string[], index: number) => void, activeDayFilter: number | null }) {
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        if (activeDayFilter === dayNum) setIsOpen(true)
    }, [activeDayFilter, dayNum])

    const isGroupActive = activeDayFilter === null || activeDayFilter === dayNum

    return (
        <div className={`mb-4 border border-gray-100 rounded-2xl shadow-sm overflow-hidden bg-white transition-opacity duration-300 ${!isGroupActive ? 'opacity-40' : 'opacity-100'}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {dayNum === 0 ? (
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                    ) : (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getDayColor(dayNum) }} />
                    )}
                    <h4 className="font-bold text-gray-900">
                        {dayNum === 0 ? 'Хуваарилагдаагүй' : `Өдөр ${dayNum}`}
                    </h4>
                    <span className="text-sm text-gray-500 font-medium px-2 py-0.5 bg-gray-200/50 rounded-full">
                        {points.length} байршил
                    </span>
                </div>
                <div className={`p-1.5 rounded-full transition-transform duration-200 ${isOpen ? 'rotate-90' : 'bg-white shadow-sm border border-gray-100'}`}>
                    <FiChevronRight className="text-gray-500" />
                </div>
            </button>
            
            {isOpen && (
                <div className="p-5 pt-4 border-t border-gray-100">
                    {/* Compact route points matching the screenshot */}
                    {points.length > 0 && (
                        <div className="mb-6 ml-2">
                            <ol className="relative space-y-0">
                                {points.map((point, idx) => {
                                    const visual = getTransportVisual(point.transport_type)
                                    const isLast = idx === points.length - 1
                                    const pointColor = getPointColor(point)

                                    return (
                                        <li key={point.id} className="relative flex gap-4 transition-opacity duration-300">
                                            {/* Timeline track */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0 z-10 shadow-sm mt-1"
                                                    style={{ backgroundColor: pointColor }}
                                                />
                                                {!isLast && (
                                                    <div className="w-0.5 flex-1 my-1 min-h-[1.5rem]" style={{ backgroundColor: hexToRgba(pointColor, 0.4), borderStyle: 'dashed' }} />
                                                )}
                                            </div>

                                            {/* Point content */}
                                            <div className={`flex-1 min-w-0 pb-5 ${isLast ? 'pb-0' : ''}`}>
                                                <div className="flex items-center flex-wrap gap-2">
                                                    <h4 className="font-bold text-gray-900 text-[15px] leading-tight flex items-center gap-2">
                                                        {point.name}
                                                    </h4>
                                                    {!isLast && (
                                                        <span
                                                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md"
                                                            style={{ backgroundColor: hexToRgba(visual.color, 0.1), color: visual.color }}
                                                        >
                                                            {visual.label} &rarr;
                                                        </span>
                                                    )}
                                                </div>

                                                {point.description && (
                                                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                                                        {point.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-3 mt-2">
                                                    {point.recommended_time_to_visit && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                                            <FiClock size={12} className="text-primary-500" />
                                                            {point.recommended_time_to_visit}
                                                        </div>
                                                    )}
                                                </div>

                                                {point.interesting_fact && (
                                                    <div className="flex gap-2 bg-amber-50 rounded-lg p-2.5 mt-2">
                                                        <FiStar size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-amber-800 leading-relaxed">
                                                            {point.interesting_fact}
                                                        </p>
                                                    </div>
                                                )}

                                                {point.images.length > 0 && (
                                                    <div className="w-full overflow-x-auto pb-1 mt-2 scrollbar-thin scrollbar-thumb-gray-300">
                                                        <div className="flex gap-2 w-max">
                                                            {point.images.map((img, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => openLightbox(point.images, i)}
                                                                    className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:opacity-90 transition-opacity"
                                                                >
                                                                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ol>
                        </div>
                    )}

                    {/* Day Detailed Description positioned below the routes map */}
                    {dayData?.description && (
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[14px] mt-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                            {dayData.description}
                        </div>
                    )}

                    {/* Day Footer / Metadata */}
                    {dayData && ((dayData.meals?.length ?? 0) > 0 || (dayData.optional_extras?.length ?? 0) > 0 || dayData.route_label) && (
                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-3 pl-3">
                            {dayData.route_label && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <FiFlag className="text-gray-400" /> {dayData.route_label}
                                </div>
                            )}
                            {dayData.meals && dayData.meals.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <FiCoffee className="text-primary-500" /> 
                                    {dayData.meals.join(', ')}
                                </div>
                            )}
                            {dayData.optional_extras && dayData.optional_extras.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <FiStar className="text-amber-500" />
                                    {dayData.optional_extras.join(', ')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function RouteTimeline({ routes = [], itineraryDays = [], travelTips, activeDayFilter = null }: RouteTimelineProps) {
    const [lightbox, setLightbox] = useState<LightboxState | null>(null)

    const openLightbox = useCallback((images: string[], index: number) => {
        setLightbox({ images, index })
    }, [])

    const closeLightbox = useCallback(() => setLightbox(null), [])

    const prev = useCallback(() =>
        setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : lb)
    , [])

    const next = useCallback(() =>
        setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb)
    , [])

    useEffect(() => {
        if (!lightbox) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lightbox, closeLightbox, prev, next])

    if (routes.length === 0 && itineraryDays.length === 0) return null

    // Merge points by day across all routes
    const dayPoints = useMemo(() => {
        const acc: Record<number, RoutePoint[]> = {}
        routes.forEach(r => {
            r.points.forEach(pt => {
                const d = pt.day_number ?? 0
                if (!acc[d]) acc[d] = []
                acc[d].push(pt)
            })
        })
        // Sort points within each day
        Object.keys(acc).forEach(d => {
            acc[Number(d)].sort((a, b) => a.order_index - b.order_index)
        })
        return acc
    }, [routes])

    // Get all valid day numbers (from itinerary + from points with no itinerary)
    const allDays = useMemo(() => {
        const set = new Set<number>()
        itineraryDays.forEach(d => set.add(d.day_number))
        Object.keys(dayPoints).forEach(d => set.add(Number(d)))
        return Array.from(set).sort((a, b) => {
            if (a === 0) return 1
            if (b === 0) return -1
            return a - b
        })
    }, [itineraryDays, dayPoints])

    return (
        <>
        <div className="space-y-6">
            {allDays.map((dayNum, idx) => {
                const dayData = itineraryDays.find(d => d.day_number === dayNum)
                const points = dayPoints[dayNum] || []

                return (
                    <DayGroup 
                        key={`day-${dayNum}-${idx}`} 
                        dayNum={dayNum} 
                        dayData={dayData}
                        points={points} 
                        activeDayFilter={activeDayFilter} 
                        openLightbox={openLightbox} 
                    />
                )
            })}

            {travelTips && (
                <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl mt-12">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary-300">
                        <FiInfo size={15} />
                        Аяллын зөвлөгөө
                    </div>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line">
                        {travelTips}
                    </div>
                </div>
            )}
        </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={22} />
                    </button>

                    {/* Prev */}
                    {lightbox.images.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); prev() }}
                            className="absolute left-4 z-10 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition-colors"
                            aria-label="Previous"
                        >
                            <FiChevronLeft size={26} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={lightbox.images[lightbox.index]}
                            alt={`Image ${lightbox.index + 1}`}
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>

                    {/* Next */}
                    {lightbox.images.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); next() }}
                            className="absolute right-4 z-10 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition-colors"
                            aria-label="Next"
                        >
                            <FiChevronRight size={26} />
                        </button>
                    )}

                    {/* Counter */}
                    {lightbox.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
                            {lightbox.index + 1} / {lightbox.images.length}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
