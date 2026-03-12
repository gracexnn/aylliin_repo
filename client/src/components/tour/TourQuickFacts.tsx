import {
    FiClock,
    FiUsers,
    FiGlobe,
    FiSun,
    FiInfo,
    FiStar,
} from 'react-icons/fi'
import {
    MdDirectionsCar,
    MdDirectionsBus,
    MdDirectionsWalk,
    MdFlight,
    MdDirectionsBoat,
} from 'react-icons/md'
import type { TransportMode } from '@/lib/types'

export interface QuickFactsData {
    durationDays?: number
    durationNights?: number
    groupSize?: string | null
    ageRange?: string | null
    language?: string | null
    season?: string | null
    transportModes?: TransportMode[]
    attractionCount?: number
}

const TRANSPORT_LABELS: Partial<Record<TransportMode, string>> = {
    DRIVING: 'Автомашин',
    BUS: 'Автобус',
    WALKING: 'Явган',
    PLANE: 'Нисэх онгоц',
    FERRY: 'Усан онгоц',
    BOAT: 'Завь',
    CYCLING: 'Дугуй',
    TRAIN: 'Галт тэрэг',
    HELICOPTER: 'Нисдэг тэрэг',
}

function TransportIcon({ mode }: { mode: TransportMode }) {
    const cls = 'w-5 h-5 shrink-0'
    switch (mode) {
        case 'DRIVING': return <MdDirectionsCar className={cls} />
        case 'BUS': return <MdDirectionsBus className={cls} />
        case 'WALKING': return <MdDirectionsWalk className={cls} />
        case 'PLANE': case 'HELICOPTER': return <MdFlight className={cls} />
        case 'FERRY': case 'BOAT': return <MdDirectionsBoat className={cls} />
        default: return <MdDirectionsCar className={cls} />
    }
}

interface FactItemProps {
    icon: React.ReactNode
    label: string
    value: string
}

function FactItem({ icon, label, value }: FactItemProps) {
    return (
        <div className="flex flex-col items-center text-center gap-2 p-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{value}</p>
            </div>
        </div>
    )
}

export default function TourQuickFacts({
    durationDays,
    durationNights,
    groupSize,
    ageRange,
    language,
    season,
    transportModes = [],
    attractionCount,
}: QuickFactsData) {
    const facts: FactItemProps[] = []

    if (durationDays && durationDays > 0) {
        const nights = durationNights ?? durationDays - 1
        facts.push({
            icon: <FiClock className="w-5 h-5" />,
            label: 'Хугацаа',
            value: `${durationDays} өдөр / ${nights} шөнө`,
        })
    }

    if (groupSize) {
        facts.push({
            icon: <FiUsers className="w-5 h-5" />,
            label: 'Бүлгийн хэмжээ',
            value: groupSize,
        })
    }

    if (ageRange) {
        facts.push({
            icon: <FiInfo className="w-5 h-5" />,
            label: 'Насны хязгаар',
            value: ageRange,
        })
    }

    if (language) {
        facts.push({
            icon: <FiGlobe className="w-5 h-5" />,
            label: 'Хэл',
            value: language,
        })
    }

    if (season) {
        facts.push({
            icon: <FiSun className="w-5 h-5" />,
            label: 'Улирал',
            value: season,
        })
    }

    if (transportModes.length > 0) {
        const unique = [...new Set(transportModes)]
        facts.push({
            icon: <TransportIcon mode={unique[0]} />,
            label: 'Тээвэр',
            value: unique.map(m => TRANSPORT_LABELS[m] ?? m).join(', '),
        })
    }

    if (attractionCount && attractionCount > 0) {
        facts.push({
            icon: <FiStar className="w-5 h-5" />,
            label: 'Үзвэр',
            value: `${attractionCount} байршил`,
        })
    }

    if (facts.length === 0) return null

    // Cap at 6 for clean grid display
    const displayFacts = facts.slice(0, 6)

    return (
        <section className="bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className={`grid divide-x divide-y divide-gray-100 ${
                        displayFacts.length <= 3
                            ? `grid-cols-${displayFacts.length}`
                            : 'grid-cols-3 sm:grid-cols-6'
                    }`}
                >
                    {displayFacts.map((fact, i) => (
                        <FactItem key={i} {...fact} />
                    ))}
                </div>
            </div>
        </section>
    )
}
