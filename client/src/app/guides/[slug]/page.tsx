import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RouteSection from '@/components/RouteSection'
import TourSidebar from '@/components/TourSidebar'
import TourHero from '@/components/tour/TourHero'
import TourQuickFacts from '@/components/tour/TourQuickFacts'
import TourHighlights from '@/components/tour/TourHighlights'
import TourIncludedExcluded from '@/components/tour/TourIncludedExcluded'
import TourGoodToKnow from '@/components/tour/TourGoodToKnow'
import TourDailyCards from '@/components/tour/TourDailyCards'
import TourPricingCTA from '@/components/tour/TourPricingCTA'
import TourStickyCTA from '@/components/tour/TourStickyCTA'
import { getTravelGuide, getDepartureSessions, getLandingSettings } from '@/lib/api'
import type { TransportMode } from '@/lib/types'

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

    // Fetch sessions and site settings in parallel
    const [departureSessions, landingSettings] = await Promise.all([
        getDepartureSessions(post.id),
        getLandingSettings(),
    ])

    // ── Derived data ───────────────────────────────────────────
    const includedItems   = post.included_items  ?? []
    const excludedItems   = post.excluded_items  ?? []
    const attractionItems = post.attraction_items ?? []
    const itineraryDays   = post.itinerary_days  ?? []
    const totalPoints     = routes.reduce((acc, r) => acc + r.points.length, 0)

    // Duration label
    const durationLabel = itineraryDays.length > 0
        ? `${itineraryDays.length} өдөр / ${itineraryDays.length - 1} шөнө`
        : null

    // Unique transport modes from route points
    const transportModes: TransportMode[] = [
        ...new Set(routes.flatMap((r) => r.points.map((p) => p.transport_type))),
    ]

    const whatsapp = landingSettings?.contact_whatsapp ?? null

    return (
        <>
            <Navbar />

            {/* ── 1. Hero ─────────────────────────────────────────── */}
            <TourHero
                post={post}
                routes={routes}
                itineraryDays={itineraryDays}
                totalPoints={totalPoints}
                attractionItems={attractionItems}
            />

            {/* ── 2. Quick Facts strip ────────────────────────────── */}
            <TourQuickFacts
                durationDays={itineraryDays.length > 0 ? itineraryDays.length : undefined}
                transportModes={transportModes}
                attractionCount={attractionItems.length}
            />

            {/* ── Main layout: content + sticky sidebar ─────────── */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">

                        {/* ── Left: Marketing content ───────────────────── */}
                        <div className="min-w-0 space-y-8 order-2 lg:order-1">

                            {/* Journey overview */}
                            {post.journey_overview && (
                                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-2">
                                        Аяллын тойм
                                    </p>
                                    <p className="text-gray-700 text-base leading-relaxed max-w-3xl">
                                        {post.journey_overview}
                                    </p>
                                </section>
                            )}

                            {/* ── 3. Highlights ──────────────────────────── */}
                            <TourHighlights items={attractionItems} />

                            {/* ── 5. Included / Excluded ─────────────────── */}
                            <TourIncludedExcluded
                                included={includedItems}
                                excluded={excludedItems}
                            />

                            {/* ── 4. Interactive Itinerary & Map ─────────── */}
                            {(routes.length > 0 || itineraryDays.length > 0) && (
                                <section id="itinerary" className="scroll-mt-24 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Аяллын хөтөлбөр
                                        </h2>
                                        {itineraryDays.length > 0 && (
                                            <span className="text-sm text-gray-500">
                                                {itineraryDays.length} өдөр
                                            </span>
                                        )}
                                    </div>

                                    {/* Structured day-by-day overview cards */}
                                    {itineraryDays.length > 0 && (
                                        <TourDailyCards days={itineraryDays} />
                                    )}

                                    {/* Interactive map + synced timeline (preserved) */}
                                    <RouteSection
                                        routes={routes}
                                        itineraryDays={itineraryDays}
                                        travelTips={null}
                                    />
                                </section>
                            )}

                            {/* ── Good to Know ───────────────────────────── */}
                            {post.travel_tips && (
                                <TourGoodToKnow travelTips={post.travel_tips} />
                            )}

                            {/* Rich-text article body */}
                            {post.content && (
                                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                    <article
                                        className="prose prose-gray prose-lg max-w-none"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />
                                </section>
                            )}

                            {/* ── 6. Pricing & Close ─────────────────────── */}
                            <TourPricingCTA
                                departureSessions={departureSessions}
                                whatsappNumber={whatsapp}
                                title="Энэ аяллыг захиалах"
                            />
                        </div>

                        {/* ── Right: Sticky sidebar (desktop) ──────────── */}
                        <aside className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
                            <TourSidebar
                                departureSessions={departureSessions}
                                itineraryDays={itineraryDays.length}
                                routeCount={routes.length}
                                totalPoints={totalPoints}
                                attractionCount={attractionItems.length}
                            />

                            {/* Quick summary card */}
                            <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm">
                                    Товч мэдээлэл
                                </h3>
                                <dl className="space-y-2.5">
                                    {itineraryDays.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Хугацаа</dt>
                                            <dd className="font-medium text-gray-800">
                                                {itineraryDays.length} өдөр
                                            </dd>
                                        </div>
                                    )}
                                    {routes.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Маршрут</dt>
                                            <dd className="font-medium text-gray-800">{routes.length}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <dt className="text-gray-500">Нийт зогсоол</dt>
                                        <dd className="font-medium text-gray-800">{totalPoints}</dd>
                                    </div>
                                    {transportModes.length > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-gray-500">Тээвэр</dt>
                                            <dd className="font-medium text-gray-800 capitalize text-right max-w-36 truncate">
                                                {transportModes
                                                    .map(
                                                        (m) =>
                                                            m.charAt(0).toUpperCase() +
                                                            m.slice(1).toLowerCase(),
                                                    )
                                                    .join(', ')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Link
                                        href="/guides"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                    >
                                        ← Багцууд руу буцах
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* ── 7. Sticky mobile bottom CTA ───────────────────── */}
            <TourStickyCTA
                departureSessions={departureSessions}
                title={post.title}
                whatsappNumber={whatsapp}
            />

            <Footer />
        </>
    )
}
