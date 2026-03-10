import type { PackageOption } from '@/lib/types'
import { FiCalendar, FiCheckCircle, FiMap, FiStar } from 'react-icons/fi'

interface GuidePackagesProps {
    journeyOverview?: string | null
    packages?: PackageOption[] | null
    includedItems?: string[] | null
    attractionItems?: string[] | null
}

export default function GuidePackages({
    journeyOverview,
    packages,
    includedItems,
    attractionItems,
}: GuidePackagesProps) {
    const safePackages = packages ?? []
    const safeIncludedItems = includedItems ?? []
    const safeAttractionItems = attractionItems ?? []

    if (
        !journeyOverview &&
        safePackages.length === 0 &&
        safeIncludedItems.length === 0 &&
        safeAttractionItems.length === 0
    ) {
        return null
    }

    return (
        <section className="bg-white py-14 border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {(journeyOverview || safePackages.length > 0) && (
                    <div className="space-y-5">
                        <div>
                            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                                <FiMap size={12} />
                                Аяллын сонголтууд
                            </span>
                            {journeyOverview && (
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                    {journeyOverview}
                                </h2>
                            )}
                        </div>

                        {safePackages.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {safePackages.map((pkg, index) => (
                                    <div
                                        key={`${pkg.title}-${index}`}
                                        className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {pkg.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {pkg.route_path}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-gray-900 text-white text-xs font-semibold px-3 py-1.5">
                                                {pkg.duration_label}
                                            </span>
                                        </div>

                                        {(pkg.departures ?? []).length > 0 && (
                                            <div className="space-y-3 mb-5">
                                                {(pkg.departures ?? []).map((departure, departureIndex) => (
                                                    <div
                                                        key={`${departure.label}-${departureIndex}`}
                                                        className="rounded-2xl bg-white border border-gray-100 p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-2">
                                                                <FiCalendar className="text-primary-600 mt-0.5" size={14} />
                                                                <span className="text-sm text-gray-700 font-medium">
                                                                    {departure.label}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {departure.price}
                                                                </div>
                                                                {departure.secondary_price && (
                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        {departure.secondary_price}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(pkg.notes ?? []).length > 0 && (
                                            <div className="space-y-2">
                                                {(pkg.notes ?? []).map((note, noteIndex) => (
                                                    <div key={`${note}-${noteIndex}`} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <FiCheckCircle className="text-primary-500 mt-0.5 shrink-0" size={14} />
                                                        <span>{note}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(safeIncludedItems.length > 0 || safeAttractionItems.length > 0) && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {safeIncludedItems.length > 0 && (
                            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Хөтөлбөрт багтсан зүйлс
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {safeIncludedItems.map((item, index) => (
                                        <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                                            <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={14} />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {safeAttractionItems.length > 0 && (
                            <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Онцлох үзвэрүүд
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {safeAttractionItems.map((item, index) => (
                                        <span
                                            key={`${item}-${index}`}
                                            className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3 py-2 text-sm text-gray-700"
                                        >
                                            <FiStar className="text-amber-500" size={13} />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
