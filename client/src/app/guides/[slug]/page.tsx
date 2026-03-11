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
import { getTravelGuide, getDepartureSessions } from '@/lib/api'
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi'

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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
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
    // Fetch departure sessions for this post
    const departureSessions = await getDepartureSessions(post.id)
    const totalPoints = routes.reduce((acc, r) => acc + r.points.length, 0)
    const packageOptions = post.package_options ?? []
    const includedItems = post.included_items ?? []
    const attractionItems = post.attraction_items ?? []
    const packageCount = packageOptions.length
    const itineraryDays = post.itinerary_days ?? []

    return (
        <>
            <Navbar />

            {/* Cover image hero */}
            <section className="relative h-[55vh] min-h-85 bg-gray-900 overflow-hidden">
                {post.cover_image ? (
                    <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover opacity-60"
                        sizes="100vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-primary-800" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/30 to-transparent" />

                {/* Hero text */}
                <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
                    >
                        <FiArrowLeft size={14} /> Бүх багц
                    </Link>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3 text-balance">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                </div>
            </section>

            {/* Meta bar */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <FiCalendar size={13} className="text-primary-500" />
                        {formatDate(post.created_at)}
                    </div>
                    {routes.length > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <FiMapPin size={13} className="text-primary-500" />
                            {routes.length} route{routes.length !== 1 ? 's' : ''} · {totalPoints} stop{totalPoints !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            <GuidePackages
                departureSessions={departureSessions}
                journeyOverview={post.journey_overview}
                packages={packageOptions}
                includedItems={includedItems}
                attractionItems={attractionItems}
            />

            {/* ─── Interactive Route Map ───────────────────────── */}
            {routes.length > 0 && (
                <section className="bg-gray-950 py-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 mb-5">
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
                    </div>
                </section>
            )}

            {/* Main content */}
            <main className="bg-gray-50 py-14">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Body text */}
                        <div className="lg:col-span-2">
                            <ItineraryTimeline
                                days={itineraryDays}
                                travelTips={post.travel_tips}
                            />

                            {post.content && (
                                <article
                                    className="prose prose-gray prose-lg max-w-none mb-12 mt-12"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            )}

                            {/* Routes */}
                            {routes.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                                        Маршрутын дэлгэрэнгүй
                                    </h2>
                                    <RouteTimeline routes={routes} />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Quick summary card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-32">
                                <h3 className="font-bold text-gray-900 mb-4 text-base">
                                    Товч мэдээлэл
                                </h3>
                                <dl className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Нийтэлсэн</dt>
                                        <dd className="font-medium text-gray-800">
                                            {formatDate(post.created_at)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Маршрут</dt>
                                        <dd className="font-medium text-gray-800">
                                            {routes.length}
                                        </dd>
                                    </div>
                                    {packageCount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Багц</dt>
                                            <dd className="font-medium text-gray-800">
                                                {packageCount}
                                            </dd>
                                        </div>
                                    )}
                                    {itineraryDays.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Хөтөлбөрийн өдөр</dt>
                                            <dd className="font-medium text-gray-800">
                                                {itineraryDays.length}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Нийт цэг</dt>
                                        <dd className="font-medium text-gray-800">
                                            {totalPoints}
                                        </dd>
                                    </div>
                                    {routes.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Тээвэр</dt>
                                            <dd className="font-medium text-gray-800 capitalize text-right max-w-30 truncate">
                                                {[
                                                    ...new Set(
                                                        routes
                                                            .flatMap((r) => r.points)
                                                            .map((p) =>
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

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <Link
                                        href="/guides"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                    >
                                        <FiArrowLeft size={13} /> Багцууд руу буцах
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
