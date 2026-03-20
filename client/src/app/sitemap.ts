import type { MetadataRoute } from 'next'
import siteConfig from '@/tenant-config'
import { getPosts } from '@/lib/api'

export const revalidate = 3600

function getBaseUrl() {
    return siteConfig.url.replace(/\/$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl()
    const now = new Date()

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/guides`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ]

    try {
        const { posts } = await getPosts(1, 1000)

        const guideRoutes: MetadataRoute.Sitemap = posts
            .filter((post) => post.published)
            .map((post) => ({
                url: `${baseUrl}/guides/${post.slug}`,
                lastModified: new Date(post.updated_at || post.created_at),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))

        return [...staticRoutes, ...guideRoutes]
    } catch {
        // Keep sitemap available even if upstream API is temporarily unavailable.
        return staticRoutes
    }
}
