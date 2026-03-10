'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
    FiArrowRight,
    FiChevronLeft,
    FiChevronRight,
    FiCompass,
    FiMapPin,
    FiStar,
} from 'react-icons/fi'
import type { Post } from '@/lib/types'

const AUTOPLAY_DELAY = 5500

interface HeroTravelSwiperProps {
    posts: Post[]
}

function getSlideDescription(post: Post) {
    return (
        post.excerpt ??
        post.journey_overview ??
        'Сонгомол маршрут, орон нутгийн зөвлөмж, бодит аяллын мэдрэмжийг нэг дороос аваарай.'
    )
}

export default function HeroTravelSwiper({ posts }: HeroTravelSwiperProps) {
    const slides = useMemo(() => posts.slice(0, 5), [posts])
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (slides.length <= 1 || isPaused) return

        const intervalId = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length)
        }, AUTOPLAY_DELAY)

        return () => window.clearInterval(intervalId)
    }, [isPaused, slides.length])

    useEffect(() => {
        if (activeIndex >= slides.length) {
            setActiveIndex(0)
        }
    }, [activeIndex, slides.length])

    if (slides.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="relative rounded-[28px] border border-white/10 bg-slate-950/45 p-6 shadow-inner shadow-black/20 sm:p-7">
                    <div className="mb-4 inline-flex rounded-2xl bg-primary-400/15 p-3 text-primary-100">
                        <FiCompass size={20} />
                    </div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-200/80">
                        Hero highlight
                    </p>
                    <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                        Онцлох аяллуудаа admin дээрээс сонгоод энд харуулаарай.
                    </h2>
                    <p className="text-sm leading-7 text-white/65 sm:text-base">
                        “Hero-д онцлох” сонголтыг асаасан нийтлэгдсэн хөтөчүүд энд автоматаар slider байдлаар гарна.
                    </p>
                </div>
            </div>
        )
    }

    const activePost = slides[activeIndex]
    const previewLabels = (activePost.attraction_items ?? []).slice(0, 3)
    const packageCount = activePost.package_options?.length ?? 0

    const goToPrevious = () => {
        setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
    }

    const goToNext = () => {
        setActiveIndex((current) => (current + 1) % slides.length)
    }

    return (
        <div
            className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff1e,transparent_38%),linear-gradient(160deg,#ffffff14,transparent_45%)]" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 shadow-inner shadow-black/20">
                <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
                        <FiStar size={12} className="text-accent-400" />
                        Admin highlight
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={goToPrevious}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/90 backdrop-blur-md transition hover:bg-black/40"
                            aria-label="Previous slide"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={goToNext}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/90 backdrop-blur-md transition hover:bg-black/40"
                            aria-label="Next slide"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="relative min-h-125">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePost.id}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="absolute inset-0"
                        >
                            {activePost.cover_image ? (
                                <Image
                                    src={activePost.cover_image}
                                    alt={activePost.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-linear-to-br from-primary-600 via-slate-900 to-accent-500" />
                            )}

                            <div className="absolute inset-0 bg-linear-to-b from-slate-950/10 via-slate-950/30 to-slate-950/90" />
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/70">
                                    {packageCount > 0 && (
                                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                                            {packageCount} багцтай
                                        </span>
                                    )}
                                    {activePost.journey_overview && (
                                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                                            {activePost.journey_overview}
                                        </span>
                                    )}
                                </div>

                                <h3 className="mb-3 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                                    {activePost.title}
                                </h3>
                                <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                                    {getSlideDescription(activePost)}
                                </p>

                                {previewLabels.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {previewLabels.map((label) => (
                                            <span
                                                key={label}
                                                className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="inline-flex items-center gap-2 text-sm text-white/65">
                                        <FiMapPin size={14} className="text-primary-200" />
                                        Сонгомол аяллын чиглэл
                                    </div>

                                    <Link
                                        href={`/guides/${activePost.slug}`}
                                        className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition hover:bg-white/90"
                                    >
                                        Дэлгэрэнгүй үзэх <FiArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="grid gap-2 border-t border-white/10 bg-slate-950/70 p-4 sm:grid-cols-2">
                    {slides.map((post, index) => (
                        <button
                            key={post.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                                index === activeIndex
                                    ? 'border-primary-300/60 bg-white/10 text-white'
                                    : 'border-white/6 bg-white/3 text-white/60 hover:bg-white/6 hover:text-white/80'
                            }`}
                        >
                            <div className="mb-1 text-xs uppercase tracking-[0.18em] text-primary-200/75">
                                0{index + 1}
                            </div>
                            <div className="line-clamp-2 text-sm font-medium leading-6">
                                {post.title}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
