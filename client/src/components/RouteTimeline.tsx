import Image from 'next/image'
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
import { FiClock, FiStar, FiMapPin } from 'react-icons/fi'
import type { Route, TransportMode } from '@/lib/types'

const transportConfig: Record<
    TransportMode,
    { icon: React.ElementType; label: string; color: string }
> = {
    WALKING:    { icon: MdDirectionsWalk,  label: 'Явган',       color: 'bg-green-100 text-green-700' },
    DRIVING:    { icon: MdDirectionsCar,   label: 'Машин',       color: 'bg-blue-100 text-blue-700' },
    CYCLING:    { icon: MdDirectionsBike,  label: 'Дугуй',       color: 'bg-yellow-100 text-yellow-700' },
    BUS:        { icon: MdDirectionsBus,   label: 'Автобус',     color: 'bg-orange-100 text-orange-700' },
    TRAIN:      { icon: MdTrain,           label: 'Галт тэрэг',  color: 'bg-purple-100 text-purple-700' },
    TRAM:       { icon: MdTram,            label: 'Трамвай',     color: 'bg-pink-100 text-pink-700' },
    SUBWAY:     { icon: MdSubway,          label: 'Метро',       color: 'bg-red-100 text-red-700' },
    BOAT:       { icon: MdDirectionsBoat,  label: 'Завь',        color: 'bg-cyan-100 text-cyan-700' },
    FERRY:      { icon: MdDirectionsBoat,  label: 'Усан онгоц',  color: 'bg-teal-100 text-teal-700' },
    PLANE:      { icon: MdFlight,          label: 'Нислэг',      color: 'bg-sky-100 text-sky-700' },
    HELICOPTER: { icon: MdFlightTakeoff,   label: 'Нисдэг тэрэг', color: 'bg-indigo-100 text-indigo-700' },
}

interface RouteTimelineProps {
    routes: Route[]
}

export default function RouteTimeline({ routes }: RouteTimelineProps) {
    if (routes.length === 0) return null

    return (
        <div className="space-y-10">
            {routes.map((route) => (
                <div key={route.id}>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiMapPin className="text-primary-600" />
                        {route.title}
                    </h3>

                    <ol className="relative space-y-0">
                        {route.points.map((point, idx) => {
                            const transport = transportConfig[point.transport_type]
                            const TransportIcon = transport.icon
                            const isLast = idx === route.points.length - 1

                            return (
                                <li key={point.id} className="relative flex gap-5">
                                    {/* Timeline track */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white shadow-sm ${transport.color}`}
                                        >
                                            <TransportIcon size={18} />
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[2rem]" />
                                        )}
                                    </div>

                                    {/* Point content */}
                                    <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                                        <div className="flex items-start flex-wrap gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900 text-base leading-tight">
                                                {point.name}
                                            </h4>
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${transport.color}`}
                                            >
                                                <TransportIcon size={11} />
                                                {transport.label}
                                            </span>
                                        </div>

                                        {point.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                {point.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-4 mb-3">
                                            {point.recommended_time_to_visit && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                                    <FiClock size={12} className="text-primary-500" />
                                                    {point.recommended_time_to_visit}
                                                </div>
                                            )}
                                        </div>

                                        {point.interesting_fact && (
                                            <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                                                <FiStar size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-amber-800 leading-relaxed">
                                                    <span className="font-semibold">Сонирхолтой баримт: </span>
                                                    {point.interesting_fact}
                                                </p>
                                            </div>
                                        )}

                                        {point.images.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {point.images.map((img, i) => (
                                                    <div
                                                        key={i}
                                                        className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
                                                    >
                                                        <Image
                                                            src={img}
                                                            alt={`${point.name} image ${i + 1}`}
                                                            fill
                                                            className="object-cover"
                                                            sizes="112px"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </div>
            ))}
        </div>
    )
}
