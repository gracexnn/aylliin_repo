import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GuidePackages from '@/components/GuidePackages'
import ItineraryTimeline from '@/components/ItineraryTimeline'
import RouteTimeline from '@/components/RouteTimeline'
import RouteMap from '@/components/RouteMap'
import TourSidebar from '@/components/TourSidebar'
import { getTravelGuide, getDepartureSessions } from '@/lib/api'
import { FiArrowLeft, FiClock, FiMap, FiMapPin, FiStar } from 'react-icons/fi'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    try {
        const { post } = await getTravelGuide(slug)
        return {
            title: post.title,
            description: post.excerpt ?? undefined,
            openGraph: {
                title: post.title,
                description: post.excerpt ?? undefined,
                images: post.cover_image ? [post.cover_image] : [],
            },
        }
    } catch {
        return { title: 'Аяллын багц' }
    }
}

export default async function GuideDetailPage({ params }: Props) {
    const { slug } = await params

    let guide: Awaited<ReturnType<typeof getTravelGuide>>
    try {
        guide = await getTravelGuide(slug)
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Not found') notFound()
        throw err
    }

    const { post, routes } = guide
    const departureSessions = await getDepartureSessions(post.id)
    const totalPoints = routes.reduce((acc, r) => acc + r.points.length, 0)
    const includedItems = post.included_items ?? []
    const attractionItems = post.attraction_items ?? []
    const itineraryDays = post.itinerary_days ?? []

    return (
        <>
            <Navbar />

            {/* ── Hero ─────────────────────────────────────────────── */}
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

            {/* ── Main content + sidebar ─────────────────────────── */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">

                        {/* ── Left: Main content ─────────────────────── */}
                        <div className="min-w-0 space-y-8">

                            {/* Overview + Attractions + Included (booking moved to sidebar) */}
                            <GuidePackages
                                journeyOverview={post.journey_overview}
                                packages={post.package_options}
                                includedItems={includedItems}
                                attractionItems={attractionItems}
                                departureSessions={[]}
                            />

                            {/* Itinerary */}
                            {itineraryDays.length > 0 && (
                                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                            <FiClock size={15} className="text-primary-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Аяллын хөтөлбөр
                                        </h2>
                                    </div>
                                    <ItineraryTimeline
                                        days={itineraryDays}
                                        travelTips={post.travel_tips}
                                    />
                                </section>
                            )}

                            {/* Interactive Route Map */}
                            {routes.length > 0 && (
                                <section className="bg-gray-950 rounded-3xl overflow-hidden shadow-sm">
                                    <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                                            <FiMapPin size={15} className="text-primary-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-bold text-lg leading-none">
                                                Интерактив маршрут
                                            </h2>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                Дурын цэг дээр дарж мэдээлэл үзнэ · Дугуйгаар томруулна
                                            </p>
                                        </div>
                                    </div>
                                    <RouteMap routes={routes} itineraryDays={itineraryDays} />
                                </section>
                            )}

                            {/* Route details */}
                            {routes.length > 0 && (
                                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                            <FiMap size={15} className="text-primary-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Маршрутын дэлгэрэнгүй
                                        </h2>
                                    </div>
                                    <RouteTimeline routes={routes} />
                                </section>
                            )}

                            {/* Article content */}
                            {post.content && (
                                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <article
                                        className="prose prose-gray prose-lg max-w-none"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />
                                </section>
                            )}
                        </div>

                        {/* ── Right: Sticky sidebar ──────────────────── */}
                        <aside>
                            <div className="sticky top-24">
                                <TourSidebar
                                    departureSessions={departureSessions}
                                    itineraryDays={itineraryDays.length}
                                    routeCount={routes.length}
                                    totalPoints={totalPoints}
                                    attractionCount={attractionItems.length}
                                />

                                {/* Quick summary */}
                                <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 text-sm">
                                        Товч мэдээлэл
                                    </h3>
                                    <dl className="space-y-2.5">
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Маршрут</dt>
                                            <dd className="font-medium text-gray-800">{routes.length}</dd>
                                        </div>
                                        {itineraryDays.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <dt className="text-gray-500">Хөтөлбөрийн өдөр</dt>
                                                <dd className="font-medium text-gray-800">
                                                    {itineraryDays.length}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Нийт зогсоол</dt>
                                            <dd className="font-medium text-gray-800">{totalPoints}</dd>
                                        </div>
                                        {routes.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <dt className="text-gray-500">Тээвэр</dt>
                                                <dd className="font-medium text-gray-800 capitalize text-right max-w-36 truncate">
                                                    {[
                                                        ...new Set(
                                                            routes
                                                                .flatMap((r) => r.points)
                                                                .map(
                                                                    (p) =>
                                                                        p.transport_type
                                                                            .charAt(0)
                                                                            .toUpperCase() +
                                                                        p.transport_type
                                                                            .slice(1)
                                                                            .toLowerCase(),
                                                                ),
                                                        ),
                                                    ].join(', ')}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Link
                                            href="/guides"
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                        >
                                            <FiArrowLeft size={13} /> Багцууд руу буцах
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
