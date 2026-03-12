import { FiCoffee, FiSun, FiMoon } from 'react-icons/fi'
import type { ItineraryDay } from '@/lib/types'

interface TourDailyCardsProps {
    days: ItineraryDay[]
}

const MEAL_ICONS: Record<string, React.ReactNode> = {
    'Өглөөний цай': <FiCoffee size={12} />,
    'Үдийн хоол': <FiSun size={12} />,
    'Оройн хоол': <FiMoon size={12} />,
}

function MealBadge({ meal }: { meal: string }) {
    const icon = MEAL_ICONS[meal] ?? <FiCoffee size={12} />
    return (
        <span className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-full font-medium">
            {icon}
            {meal}
        </span>
    )
}

export default function TourDailyCards({ days }: TourDailyCardsProps) {
    if (!days || days.length === 0) return null

    return (
        <div className="space-y-4">
            {days
                .slice()
                .sort((a, b) => a.day_number - b.day_number)
                .map((day, i) => (
                    <div
                        key={day.id ?? i}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                        {/* Day header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {day.day_number}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">
                                    {day.title}
                                </h4>
                                {day.route_label && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {day.route_label}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Day content */}
                        <div className="px-5 py-4 space-y-3">
                            {/* Description */}
                            {day.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {day.description}
                                </p>
                            )}

                            {/* Meals */}
                            {day.meals && day.meals.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                        Хоол
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {day.meals.map((meal, j) => (
                                            <MealBadge key={j} meal={meal} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Optional extras */}
                            {day.optional_extras && day.optional_extras.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                        Нэмэлт үйлчилгээ
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {day.optional_extras.map((extra, j) => (
                                            <span
                                                key={j}
                                                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                                            >
                                                {extra}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    )
}
