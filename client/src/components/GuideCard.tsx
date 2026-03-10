import Link from 'next/link'
import Image from 'next/image'
import { FiArrowRight, FiMapPin, FiCalendar } from 'react-icons/fi'
import type { Post } from '@/lib/types'

interface GuideCardProps {
    post: Post
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export default function GuideCard({ post }: GuideCardProps) {
    return (
        <Link
            href={`/guides/${post.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        >
            {/* Cover image */}
            <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                {post.cover_image ? (
                    <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                        <FiMapPin size={40} className="text-white/60" />
                    </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1 mb-4">
                        {post.excerpt}
                    </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FiCalendar size={12} />
                        <span>{formatDate(post.created_at)}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all">
                        Дэлгэрэнгүй <FiArrowRight size={13} />
                    </span>
                </div>
            </div>
        </Link>
    )
}
