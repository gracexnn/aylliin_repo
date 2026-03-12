import { FiAlertCircle } from 'react-icons/fi'

interface TourGoodToKnowProps {
    /** Raw HTML or plain text tips from the CMS */
    travelTips?: string | null
    /** Optional structured bullet items */
    tipItems?: string[]
}

export default function TourGoodToKnow({ travelTips, tipItems = [] }: TourGoodToKnowProps) {
    if (!travelTips && tipItems.length === 0) return null

    return (
        <section
            id="good-to-know"
            className="bg-amber-50 rounded-3xl border border-amber-100 p-6 sm:p-8"
        >
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FiAlertCircle size={16} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Мэдэх зүйлс</h2>
            </div>

            {/* Structured tip list */}
            {tipItems.length > 0 && (
                <ul className="space-y-2.5 mb-5">
                    {tipItems.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            )}

            {/* Raw CMS content */}
            {travelTips && (
                <div
                    className="prose prose-sm prose-gray max-w-none prose-a:text-primary-600"
                    dangerouslySetInnerHTML={{ __html: travelTips }}
                />
            )}
        </section>
    )
}
