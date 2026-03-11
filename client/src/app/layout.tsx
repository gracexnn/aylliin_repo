import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import '@/app/globals.css'
import SiteVisitTracker from '@/components/site-visit-tracker'
import siteConfig from '@/site.config'

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
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
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
