import Image from 'next/image'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiClock, FiMap, FiStar } from 'react-icons/fi'
import type { Post, Route, ItineraryDay } from '@/lib/types'

interface TourHeroProps {
    post: Post
    routes: Route[]
    itineraryDays: ItineraryDay[]
    totalPoints: number
    attractionItems: string[]
}

export default function TourHero({
    post,
    routes,
    itineraryDays,
    totalPoints,
    attractionItems,
}: TourHeroProps) {
    return (
        <section className="relative h-[72vh] min-h-[500px] bg-gray-900 overflow-hidden">
            {post.cover_image ? (
                <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover opacity-55"
                    sizes="100vw"
                />
            ) : (
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-primary-800" />
            )}

            {/* Gradient overlay — heavier at bottom for text legibility */}
            <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/40 to-gray-950/10" />

            <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
                    >
                        <FiArrowLeft size={14} /> Бүх багц
                    </Link>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3 text-balance max-w-3xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-5">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Tour quick stats */}
                    <div className="flex flex-wrap items-center gap-2">
                        {itineraryDays.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                                <FiClock size={12} />
                                {itineraryDays.length} өдөр
                            </span>
                        )}
                        {routes.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                                <FiMap size={12} />
                                {routes.length} маршрут · {totalPoints} зогсоол
                            </span>
                        )}
                        {attractionItems.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                                <FiStar size={12} />
                                {attractionItems.length} үзвэр
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
