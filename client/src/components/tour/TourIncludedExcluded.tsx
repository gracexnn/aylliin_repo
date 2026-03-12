import { FiCheck, FiX } from 'react-icons/fi'

interface TourIncludedExcludedProps {
    included: string[]
    excluded?: string[]
}

export default function TourIncludedExcluded({
    included,
    excluded = [],
}: TourIncludedExcludedProps) {
    if (included.length === 0 && excluded.length === 0) return null

    return (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Юу багтах вэ?</h2>

            <div className={`grid gap-6 ${excluded.length > 0 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Included */}
                {included.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                                <FiCheck size={11} className="text-primary-600" />
                            </span>
                            Багтсан
                        </h3>
                        <ul className="space-y-2">
                            {included.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <FiCheck
                                        size={14}
                                        className="text-primary-500 mt-0.5 shrink-0"
                                        strokeWidth={2.5}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Excluded */}
                {excluded.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                <FiX size={11} className="text-red-500" />
                            </span>
                            Багтаагүй
                        </h3>
                        <ul className="space-y-2">
                            {excluded.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                                    <FiX
                                        size={14}
                                        className="text-red-400 mt-0.5 shrink-0"
                                        strokeWidth={2.5}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    )
}
