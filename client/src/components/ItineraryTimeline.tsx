import type { ItineraryDay } from '@/lib/types'
import { FiClock, FiCoffee, FiFlag, FiInfo } from 'react-icons/fi'

interface ItineraryTimelineProps {
    days: ItineraryDay[]
    travelTips?: string | null
}

export default function ItineraryTimeline({ days, travelTips }: ItineraryTimelineProps) {
    if (days.length === 0 && !travelTips) {
        return null
    }

    return (
        <div className="space-y-8">
            {days.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                        Дэлгэрэнгүй хөтөлбөр
                    </h2>

                    <ol className="space-y-6">
                        {days
                            .slice()
                            .sort((a, b) => a.day_number - b.day_number)
                            .map((day) => (
                                <li key={`day-${day.day_number}-${day.title}`} className="relative flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold shadow-lg">
                                            {day.day_number}
                                        </div>
                                        <div className="w-0.5 flex-1 bg-gray-200 mt-3" />
                                    </div>

                                    <div className="flex-1 pb-2">
                                        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {day.title}
                                                </h3>
                                                {day.route_label && (
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-semibold">
                                                        <FiFlag size={12} />
                                                        {day.route_label}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                                {day.description}
                                            </p>

                                            {(day.meals.length > 0 || day.optional_extras.length > 0) && (
                                                <div className="grid gap-4 md:grid-cols-2 mt-5">
                                                    {day.meals.length > 0 && (
                                                        <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                                                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-800">
                                                                <FiCoffee className="text-primary-600" size={14} />
                                                                Хоол
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {day.meals.map((meal, index) => (
                                                                    <span
                                                                        key={`${meal}-${index}`}
                                                                        className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                                                                    >
                                                                        {meal}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {day.optional_extras.length > 0 && (
                                                        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                                                            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-amber-900">
                                                                <FiClock className="text-amber-600" size={14} />
                                                                Нэмэлт сонголт
                                                            </div>
                                                            <div className="space-y-2">
                                                                {day.optional_extras.map((extra, index) => (
                                                                    <div key={`${extra}-${index}`} className="text-sm text-amber-800">
                                                                        {extra}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ol>
                </div>
            )}

            {travelTips && (
                <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl">
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
    )
}
