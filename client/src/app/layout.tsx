import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import '@/app/globals.css'
import SiteVisitTracker from '@/components/site-visit-tracker'
import siteConfig from '@/tenant-config'

const allowIndexing = (process.env.ALLOW_INDEXING ?? process.env.NEXT_PUBLIC_ALLOW_INDEXING ?? '').toLowerCase() === 'true'

export const metadata: Metadata = {
    title: {
        default: siteConfig.fullTitle,
        template: siteConfig.titleTemplate,
    },
    description: siteConfig.description,
    icons: {
        icon: siteConfig.icons.favicon,
        apple: siteConfig.icons.apple,
    },
    robots: {
        index: allowIndexing,
        follow: allowIndexing,
        googleBot: {
            index: allowIndexing,
            follow: allowIndexing,
            noimageindex: !allowIndexing,
        },
    },
    openGraph: {
        siteName: siteConfig.name,
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="mn">
            <body>
                <Suspense fallback={null}>
                    <SiteVisitTracker />
                </Suspense>
                {children}
            </body>
        </html>
    )
}
