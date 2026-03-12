'use client'

import { useState } from 'react'
import RouteMap from './RouteMap'
import RouteTimeline from './RouteTimeline'
import type { Route, ItineraryDay } from '@/lib/types'
import { FiClock, FiMapPin } from 'react-icons/fi'

interface RouteSectionProps {
    routes: Route[]
    itineraryDays?: ItineraryDay[]
    travelTips?: string | null
}

export default function RouteSection({ routes, itineraryDays, travelTips }: RouteSectionProps) {
    const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null)

    if (routes.length === 0 && (!itineraryDays || itineraryDays.length === 0)) return null

    return (
        <>
            {routes.length > 0 && (
                <section className="bg-gray-950 rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                            <FiMapPin size={15} className="text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-none">
                                Маршрут
                            </h2>
                        </div>
                    </div>
                    <RouteMap 
                        routes={routes} 
                        itineraryDays={itineraryDays} 
                        activeDayFilter={activeDayFilter}
                        onDayFilterChange={setActiveDayFilter}
                    />
                </section>
            )}

            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <FiClock size={15} className="text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Аяллын хөтөлбөр
                    </h2>
                </div>
                <RouteTimeline 
                    routes={routes} 
                    itineraryDays={itineraryDays}
                    travelTips={travelTips}
                    activeDayFilter={activeDayFilter}
                />
            </section>
        </>
    )
}
