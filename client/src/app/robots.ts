import type { MetadataRoute } from 'next'
import siteConfig from '@/tenant-config'

export default function robots(): MetadataRoute.Robots {
    const allowIndexing = (process.env.ALLOW_INDEXING ?? process.env.NEXT_PUBLIC_ALLOW_INDEXING ?? '').toLowerCase() === 'true'
    const baseUrl = siteConfig.url.replace(/\/$/, '')

    return {
        rules: allowIndexing
            ? {
                userAgent: '*',
                allow: '/',
            }
            : {
                userAgent: '*',
                disallow: '/',
            },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
