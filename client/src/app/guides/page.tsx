import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GuideCard from '@/components/GuideCard'
import { getPosts } from '@/lib/api'
import { MdExplore } from 'react-icons/md'
import { FiSearch } from 'react-icons/fi'

export const metadata: Metadata = {
    title: 'Аяллын хөтөчүүд',
    description: 'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөөтэй аяллын хөтөчүүдийг үзээрэй.',
}

interface Props {
    searchParams: Promise<{ page?: string }>
}

export default async function GuidesPage({ searchParams }: Props) {
    const { page: pageStr } = await searchParams
    const page = Math.max(1, parseInt(pageStr ?? '1'))

    let posts: Awaited<ReturnType<typeof getPosts>>['posts'] = []
    let total = 0
    let totalPages = 1
    const limit = 12

    try {
        const data = await getPosts(page, limit)
        posts = data.posts
        total = data.total
        totalPages = Math.ceil(total / limit)
    } catch {
        // handled below
    }

    return (
        <>
            <Navbar />

            {/* Page hero */}
            <section className="bg-gradient-to-br from-slate-900 to-primary-900 pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                        <MdExplore size={13} />
                        Бүх чиглэлүүд
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                        Аяллын хөтөчүүд
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">
                        {total > 0
                            ? `Таны дараагийн аялалд урам өгөх ${total} хөтөч бэлэн байна.`
                            : 'Хөтөчүүд тун удахгүй нэмэгдэнэ.'}
                    </p>
                </div>
            </section>

            {/* Guides grid */}
            <main className="flex-1 py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <FiSearch size={24} className="text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Одоогоор хөтөч алга
                            </h2>
                            <p className="text-gray-400 max-w-sm">
                                Манай баг шинэ аяллын хөтөчүүд бэлдэж байна. Удахгүй дахин шалгана уу.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {posts.map((post) => (
                                <GuideCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            {page > 1 && (
                                <a
                                    href={`/guides?page=${page - 1}`}
                                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                >
                                    ← Өмнөх
                                </a>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <a
                                    key={p}
                                    href={`/guides?page=${p}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        p === page
                                            ? 'bg-primary-600 text-white shadow-sm'
                                            : 'border border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700'
                                    }`}
                                >
                                    {p}
                                </a>
                            ))}
                            {page < totalPages && (
                                <a
                                    href={`/guides?page=${page + 1}`}
                                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                                >
                                    Дараах →
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    )
}
