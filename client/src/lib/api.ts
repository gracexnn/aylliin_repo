import type { Post, PostsResponse, TravelGuide, DepartureSessionsResponse, DepartureSession, CreateBookingRequest, BookingResponse } from './types'

// Server-side only — no NEXT_PUBLIC_ needed. In production set ADMIN_API_URL.
const ADMIN_API = process.env.ADMIN_API_URL ?? 'http://localhost:3000'

// For client-side calls, use public env var
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:3000'
    }
    return ADMIN_API
}

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

export async function getDepartureSessions(postId: string): Promise<DepartureSession[]> {
    const res = await fetch(
        `${ADMIN_API}/api/departure-sessions?post_id=${postId}&status=OPEN&limit=100`,
        { cache: 'no-store' }
    )
    if (!res.ok) {
        // Return empty array if not found or error
        return []
    }
    const data: DepartureSessionsResponse = await res.json()
    return data.sessions
}

/**
 * Create a booking (client-side)
 */
export async function createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const res = await fetch(`${getApiUrl()}/api/public/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create booking')
    }
    
    return res.json()
}

/**
 * Check payment status for a booking (client-side)
 */
export async function checkPaymentStatus(bookingCode: string): Promise<{
    success: boolean
    paid: boolean
    message?: string
    booking?: {
        booking_code: string
        booking_status: string
        payment_status: string
    }
}> {
    const res = await fetch(`${getApiUrl()}/api/public/bookings/${bookingCode}/check-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to check payment status')
    }
    
    return res.json()
}
