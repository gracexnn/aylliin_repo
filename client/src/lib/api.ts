import type { Post, PostsResponse, TravelGuide } from './types'

// Server-side only — no NEXT_PUBLIC_ needed. In production set ADMIN_API_URL.
const ADMIN_API = process.env.ADMIN_API_URL ?? 'http://localhost:3000'

export async function getPosts(page = 1, limit = 12): Promise<PostsResponse> {
    const res = await fetch(
        `${ADMIN_API}/api/posts?page=${page}&limit=${limit}`,
        { cache: 'no-store' },
    )
    if (!res.ok) throw new Error('Failed to fetch posts')
    const data: PostsResponse = await res.json()
    // Only return published posts
    return { ...data, posts: data.posts.filter((p: Post) => p.published) }
}

export async function getHighlightedPosts(limit = 5): Promise<Post[]> {
    const res = await fetch(
        `${ADMIN_API}/api/posts?limit=${limit}&published=true&highlighted=true`,
        { cache: 'no-store' },
    )

    if (!res.ok) throw new Error('Failed to fetch highlighted posts')

    const data: PostsResponse = await res.json()

    return data.posts.filter((post) => post.published && post.highlighted)
}

export async function getTravelGuide(slug: string): Promise<TravelGuide> {
    const res = await fetch(`${ADMIN_API}/api/travel/${slug}`, {
        cache: 'no-store',
    })
    if (!res.ok) {
        if (res.status === 404) throw new Error('Not found')
        throw new Error('Failed to fetch travel guide')
    }
    return res.json()
}
