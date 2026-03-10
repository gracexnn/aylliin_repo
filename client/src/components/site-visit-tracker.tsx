'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackSiteVisit } from '@/lib/api'

const VISITOR_STORAGE_KEY = 'aylal_visitor_id'
const TRACK_CACHE_KEY = 'aylal_last_visit_event'
const DUPLICATE_WINDOW_MS = 15_000

function getVisitorId() {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing

    const nextId = window.crypto.randomUUID()
    window.localStorage.setItem(VISITOR_STORAGE_KEY, nextId)
    return nextId
}

function shouldSkipTracking(path: string) {
    const previous = window.sessionStorage.getItem(TRACK_CACHE_KEY)
    if (!previous) return false

    try {
        const parsed = JSON.parse(previous) as { path?: string; trackedAt?: number }
        return parsed.path === path && typeof parsed.trackedAt === 'number' && Date.now() - parsed.trackedAt < DUPLICATE_WINDOW_MS
    } catch {
        return false
    }
}

function rememberTracking(path: string) {
    window.sessionStorage.setItem(
        TRACK_CACHE_KEY,
        JSON.stringify({ path, trackedAt: Date.now() })
    )
}

export default function SiteVisitTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = searchParams?.toString() ?? ''

    useEffect(() => {
        if (!pathname) return

        const path = search ? `${pathname}?${search}` : pathname

        if (shouldSkipTracking(path)) {
            return
        }

        rememberTracking(path)

        void trackSiteVisit({
            visitor_id: getVisitorId(),
            path: pathname,
            referrer: document.referrer || null,
        })
    }, [pathname, search])

    return null
}
