import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GuideCard from '@/components/GuideCard'
import HeroTravelSwiper from '@/components/HeroTravelSwiper'
import { getHighlightedPosts, getPosts } from '@/lib/api'
import {
    FiArrowRight,
    FiClock,
    FiCompass,
    FiMap,
    FiMapPin,
    FiStar,
    FiTrendingUp,
    FiUsers,
} from 'react-icons/fi'
import { MdExplore } from 'react-icons/md'

async function FeaturedGuides() {
    try {
        const { posts } = await getPosts(1, 6)
        if (posts.length === 0) return null

        return (
            <section className="py-20 bg-white" id="guides">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            <MdExplore size={13} />
                            Онцлох чиглэлүүд
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Сонгомол аяллын хөтөчүүд
                        </h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            Хөтөч бүрт дэлгэрэнгүй маршрут, орон нутгийн мэдээлэл,
                            хэрэгтэй зөвлөгөө багтсан.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <GuideCard key={post.id} post={post} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/guides"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Бүх хөтөчийг үзэх <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        )
    } catch {
        return null
    }
}

const stats = [
    { icon: FiMap,   value: '50+',   label: 'Чиглэл' },
    { icon: FiStar,  value: '200+',  label: 'Маршрутын цэг' },
    { icon: FiUsers, value: '10K+',  label: 'Аялагч' },
]

const heroHighlights = [
    {
        icon: FiCompass,
        title: 'Тодорхой маршрут',
        description: 'Өдөр, байршил, шилжилт бүрийг эмх цэгцтэй дарааллаар харуулна.',
    },
    {
        icon: FiMapPin,
        title: 'Орон нутгийн өнгө аяс',
        description: 'Түгээмэл цэгүүдээс цааш тухайн газрын онцгой мэдрэмжийг мэдрүүлнэ.',
    },
    {
        icon: FiClock,
        title: 'Ухаалаг төлөвлөлт',
        description: 'Хэзээ очих, хаанаас эхлэх, юуг заавал үзэхийг нэг дороос.',
    },
]

const heroTags = ['Weekend getaway', 'Curated routes', 'Local discoveries', 'Slow travel']

export default async function HomePage() {
    const highlightedPosts = await getHighlightedPosts(4).catch(() => [])
    const heroPosts =
        highlightedPosts.length > 0
            ? highlightedPosts
            : (await getPosts(1, 4).catch(() => ({ posts: [], total: 0, page: 1, limit: 4 }))).posts

    return (
        <>
            <Navbar />

            {/* ─── Hero ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-hero-gradient">
                {/* Decorative circles */}
                <div className="absolute top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/25 blur-3xl" />
                <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
                    <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                Шинэ хөтөчүүд тогтмол нэмэгдэнэ
                            </div>

                            <div className="mb-5 flex flex-wrap gap-2">
                                {heroTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/65"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="mb-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                Аяллаа зүгээр
                                {' '}
                                <span className="text-transparent bg-linear-to-r from-primary-300 via-white to-accent-300 bg-clip-text">
                                    төлөвлөх биш,
                                </span>
                                <br />
                                утга учиртай эхлүүл.
                            </h1>

                            <p className="mb-8 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                                Aylliin бол аяллаа илүү утга учиртай, цэгцтэй,
                                урамтай төлөвлөхийг хүсдэг хүмүүст зориулсан travel guide платформ.
                                Хаашаа явахаас гадна тэнд очоод юуг мэдрэхийг ч хамт санал болгоно.
                            </p>

                            <div className="mb-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                                <Link
                                    href="/guides"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                                >
                                    Хөтөчүүд үзэх <FiArrowRight />
                                </Link>
                                <a
                                    href="#guides"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                                >
                                    Онцлох чиглэл үзэх
                                </a>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {heroHighlights.map(({ icon: Icon, title, description }) => (
                                    <div
                                        key={title}
                                        className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                                    >
                                        <div className="mb-4 inline-flex rounded-2xl bg-white/12 p-3 text-primary-200">
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="mb-2 text-base font-semibold text-white">
                                            {title}
                                        </h3>
                                        <p className="text-sm leading-6 text-white/65">
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-6 top-10 hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-md lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-primary-400/20 p-2 text-primary-200">
                                        <FiTrendingUp size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                            Most saved
                                        </p>
                                        <p className="text-sm font-semibold">Carefully curated escapes</p>
                                    </div>
                                </div>
                            </div>

                            <HeroTravelSwiper posts={heroPosts} />
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="relative mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-md sm:grid-cols-[1.25fr_1fr]">
                        <div className="border-b border-white/10 p-6 sm:border-b-0 sm:border-r">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-200/80">
                                Why it works
                            </p>
                            <h3 className="mb-2 text-2xl font-bold text-white">
                                Хүмүүс эндээс зөвхөн санаа биш, шийдвэр гаргах тодорхой байдал авдаг.
                            </h3>
                            <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                                Хэт ерөнхий зөвлөгөө биш — маршрут, цагийн хуваарь, тээврийн
                                сонголт, очих үеийн зөвлөмжийг нэгтгэснээр аяллаа итгэлтэй эхлүүлэхэд тусална.
                            </p>
                        </div>

                        <div className="flex flex-col divide-y divide-white/10 sm:divide-y-0">
                            <div className="grid flex-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {stats.map(({ icon: Icon, value, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center justify-center px-6 py-5"
                            >
                                <Icon size={20} className="text-primary-300 mb-1" />
                                <span className="text-2xl font-bold text-white">{value}</span>
                                <span className="text-xs text-white/60 mt-0.5">{label}</span>
                            </div>
                        ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
                    <span className="text-xs">доош</span>
                    <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
                        <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
                    </div>
                </div>
            </section>

            {/* ─── Featured guides ──────────────────────────────── */}
            <FeaturedGuides />

            {/* ─── About section ────────────────────────────────── */}
            <section className="py-20 bg-gray-50" id="about">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                                Бидний зорилго
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
                                Зүгээр нэг явах биш, илүү гүн мэдэр
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Aylliin нь түгээмэл аяллын замаас цааш харж,
                                тухайн газрын онцлогийг илүү сайн мэдрэхэд туслах
                                судалгаатай аяллын хөтөчүүдийн цуглуулга юм.
                            </p>
                            <p className="text-gray-500 leading-relaxed">
                                Хотын богино аялал ч бай, олон өдрийн хөтөлбөр ч бай,
                                манай маршрут ба тээврийн зөвлөгөө таныг зөв чиглэлд хөтөлнө.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Дэлгэрэнгүй маршрут', desc: 'Тээврийн төрлөөр ялгасан алхам алхмаар чиглэл.' },
                                { title: 'Орон нутгийн мэдээлэл', desc: 'Өөр газраас олдоход хэцүү сонирхолтой баримтууд.' },
                                { title: 'Хамгийн тохиромжтой үе', desc: 'Цэг бүрийг очих зөв цагийн санал.' },
                                { title: 'Зургийн цэгүүд', desc: 'Аялалд урам өгөх онцлох зураг, санаанууд.' },
                            ].map((feat) => (
                                <div
                                    key={feat.title}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                                >
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                        {feat.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {feat.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
