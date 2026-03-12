import { FiStar } from 'react-icons/fi'

interface TourHighlightsProps {
    items: string[]
    /** Max items to display; defaults to 6 */
    maxItems?: number
}

export default function TourHighlights({ items, maxItems = 6 }: TourHighlightsProps) {
    if (!items || items.length === 0) return null

    const display = items.slice(0, maxItems)

    return (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FiStar size={15} className="text-amber-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Онцлох туршлагууд</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Энэ аяллын давуу тал</p>
                </div>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3">
                {display.map((item, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 transition-colors"
                    >
                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                            <FiStar size={11} className="text-white" fill="currentColor" />
                        </span>
                        <span className="text-sm font-medium text-gray-800 leading-snug">{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}
