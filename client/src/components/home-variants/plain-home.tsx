import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getHighlightedPosts, getLandingSettings, getPosts } from '@/lib/api'
import { FiArrowRight, FiPlay, FiClock, FiMapPin } from 'react-icons/fi'
import type { Post } from '@/lib/types'

const DEFAULTS = {
	heroTitle: 'Дэлхийг өөрөөр мэдэр.',
	heroSubtitle: 'Уламжлалт групп аяллаас татгалзаж, зөвхөн танд зориулсан хэмнэлээр дэлхийтэй танилц.',
	heroPrimaryCta: { text: 'Аяллаа сонгох', url: '/guides' },
} as const

function s<T>(val: T | null | undefined, fallback: T): T {
	return val !== null && val !== undefined && val !== ('' as unknown as T) ? val : fallback
}

// Custom Luxury Destination Card specifically tailored for this theme
function CinematicCard({ post }: { post: Post }) {
	const durationDays = post.itinerary_days?.length ?? null
	const durationLabel =
		durationDays !== null
			? `${durationDays} өдөр`
			: (post.package_options?.[0]?.duration_label ?? null)

	return (
		<Link
			href={`/guides/${post.slug}`}
			className="group relative block aspect-[3/4] w-full overflow-hidden bg-zinc-900"
		>
			{/* Image Background */}
			<div className="absolute inset-0">
				{post.cover_image ? (
					<Image
						src={post.cover_image}
						alt={post.title}
						fill
						className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-zinc-800">
						<FiMapPin size={32} className="text-white/20" />
					</div>
				)}
			</div>

			{/* Gradients */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
			<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			{/* Content */}
			<div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
				{durationLabel && (
					<div className="mb-4 flex items-center gap-2 text-xs font-mono tracking-widest text-white/60 uppercase">
						<FiClock className="text-white/40" />
						{durationLabel}
					</div>
				)}
				
				<h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-2 leading-tight">
					{post.title}
				</h3>
				
				{post.excerpt && (
					<p className="mt-2 text-sm text-white/70 line-clamp-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 delay-100">
						{post.excerpt}
					</p>
				)}

				<div className="mt-6 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white opacity-0 transition-all duration-500 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 delay-150">
					<span>Дэлгэрэнгүй</span>
					<FiArrowRight />
				</div>
			</div>
		</Link>
	)
}

export default async function PlainHomePage() {
	const [highlightedPosts, settings] = await Promise.all([
		getHighlightedPosts(6).catch(() => [] as Awaited<ReturnType<typeof getHighlightedPosts>>),
		getLandingSettings(),
	])

	const posts =
		highlightedPosts.length > 0
			? highlightedPosts
			: (await getPosts(1, 6).catch(() => ({ posts: [], total: 0, page: 1, limit: 6 }))).posts

	const heroTitle = s(settings?.hero_title, DEFAULTS.heroTitle)
	const heroSubtitle = s(settings?.hero_subtitle, DEFAULTS.heroSubtitle)
	const primaryCta = {
		text: s(settings?.hero_primary_cta_text, DEFAULTS.heroPrimaryCta.text),
		url: s(settings?.hero_primary_cta_url, DEFAULTS.heroPrimaryCta.url),
	}

	return (
		<div className="bg-[#0a0a0a] text-white selection:bg-white/30">
			<Navbar initialTone="light-glass" />
			
			<main>
				{/* Hero Section - Cinematic & Minimal */}
				<section className="relative h-screen min-h-[600px] w-full overflow-hidden flex flex-col justify-end pb-24 sm:pb-32">
					<div className="absolute inset-0 select-none pointer-events-none">
						{/* Placeholder for an actual beautiful landscape image, falling back to a gradient mesh for now */}
						<div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] via-[#0a0a0a] to-[#050505] opacity-50 z-0"></div>
						<Image 
							src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"
							alt="Hero landscape"
							fill
							className="object-cover opacity-60 mix-blend-overlay"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent z-10" />
					</div>
					
					<div className="relative z-20 mx-auto w-full max-w-7xl px-6 lg:px-8">
						<div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
							<p className="font-mono text-sm tracking-[0.3em] uppercase text-white/60 mb-6 flex items-center gap-4">
								<span className="h-px w-8 bg-white/40 block"></span>
								Гадаад Аялал
							</p>
							<h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.1] text-white mb-6 lg:mb-8">
								{heroTitle}
							</h1>
							<p className="text-lg sm:text-xl font-light text-white/80 max-w-xl leading-relaxed mb-10 lg:mb-12">
								{heroSubtitle}
							</p>
							
							<div className="flex items-center gap-6">
								<Link
									href={primaryCta.url}
									className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:scale-105 active:scale-95"
								>
									<span>{primaryCta.text}</span>
									<FiArrowRight className="transition-transform group-hover:translate-x-1" />
								</Link>
								<button className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
									<FiPlay className="ml-1" />
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* Features / Philosophy - Visual & Abstract */}
				<section className="relative z-20 mx-auto max-w-7xl px-6 py-32 lg:px-8">
					<div className="grid md:grid-cols-3 gap-12 lg:gap-24">
						<div className="space-y-4">
							<h3 className="font-mono text-sm tracking-[0.2em] text-white/50">01</h3>
							<p className="text-2xl font-light text-white/90">Ямар ч яаруу хуваарьгүй, уламжлалт групп аяллаас тэс өөр тухлаг мэдрэмж.</p>
						</div>
						<div className="space-y-4">
							<h3 className="font-mono text-sm tracking-[0.2em] text-white/50">02</h3>
							<p className="text-2xl font-light text-white/90">Зөвхөн жуулчдын хөлд дарагдсан бус, нутгийн иргэдийн очдог онцгой газрууд.</p>
						</div>
						<div className="space-y-4">
							<h3 className="font-mono text-sm tracking-[0.2em] text-white/50">03</h3>
							<p className="text-2xl font-light text-white/90">Виз, тийз, буудал зэрэг бүх зүйлийг нарийвчлан төлөвлөсөн төгс шийдэл.</p>
						</div>
					</div>
				</section>

				{/* Featured Destinations */}
				<section id="featured" className="mx-auto max-w-7xl px-6 pb-40 lg:px-8">
					<div className="mb-16 flex items-end justify-between">
						<div>
							<h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-2">
								Онцлох аяллууд
							</h2>
							<p className="text-lg text-white/50 font-light">Хаашаа аялмаар байна?</p>
						</div>
						<Link href="/guides" className="hidden lg:flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors">
							Бүх маршрутыг үзэх
							<FiArrowRight />
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts.slice(0, 6).map((post) => (
							<div key={post.id} className="group cursor-pointer block">
								<CinematicCard post={post} />
							</div>
						))}
					</div>
					
					<div className="mt-12 flex justify-center lg:hidden">
						<Link href="/guides" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors">
							Бүх маршрутыг үзэх
							<FiArrowRight />
						</Link>
					</div>
				</section>
			</main>

			<Footer settings={settings} />
		</div>
	)
}

